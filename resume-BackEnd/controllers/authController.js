"use strict";

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const { User } = require("../models");
const sendControllerError = require("../utils/controllerError");
const { cleanText } = require("../utils/validation");

// In-memory OTP storage with TTL
global.otpStore = global.otpStore || new Map();

function normalizeEmail(value) {
  const email = cleanText(value, { min: 3, max: 254 });
  return email ? email.toLowerCase() : null;
}

function generateAuthData(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  const profile = {
    id: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier,
  };
  const token = jwt.sign(profile, process.env.JWT_SECRET, {
    algorithm: "HS256",
    audience: "resume-web",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "resume-api",
  });

  return { token, user: profile };
}

async function register(req, res) {
  try {
    const name = cleanText(req.body.name, { min: 2, max: 50 });
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string"
      ? req.body.password
      : "";

    if (!name || !email || password.length < 8 || password.length > 100) {
      return res.status(400).send({
        success: false,
        message: "Name, valid email and a password (min 8 chars) are required.",
      });
    }

    const existingUser = await User.count({ where: { email } });

    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "Email already registered.",
      });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).send({
      success: true,
      message: "User registered successfully.",
      data: generateAuthData(user),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to register user.");
  }
}

async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = typeof req.body.password === "string"
      ? req.body.password
      : "";

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ where: { email } });
    const matches = user ? await user.checkPassword(password) : false;

    if (!user || !matches) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password.",
      });
    }

    return res.send({
      success: true,
      message: "User logged in successfully.",
      data: generateAuthData(user),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to log in.");
  }
}

function logout(_req, res) {
  return res.send({
    success: true,
    message: "Logged out successfully. Remove the token from the client.",
  });
}

async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Valid email address is required.",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.send({
        success: true,
        message: "If an account with that email exists, a password reset code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    global.otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    console.log(`\n========================================\n[ResumeFlow OTP] Generated code for ${email}: ${otp}\n========================================\n`);

    // Dispatch email if SMTP configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          connectionTimeout: 8000,
          socketTimeout: 8000,
          auth: {
            user: process.env.SMTP_USER.trim(),
            pass: process.env.SMTP_PASS.trim().replace(/\s+/g, ""),
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        await transporter.sendMail({
          from: `"ResumeFlow" <${process.env.SMTP_USER.trim()}>`,
          to: email,
          subject: "Your ResumeFlow Password Reset OTP",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 15px;">We received a request to reset your ResumeFlow account password. Use the verification code below:</p>
              <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0d9488;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">This OTP will expire in 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
        console.log(`[ResumeFlow Email] OTP email successfully dispatched to ${email}`);
      } catch (mailErr) {
        console.error("[ResumeFlow Email Warning]", mailErr.message);
      }
    }

    return res.send({
      success: true,
      message: `A 6-digit OTP verification code has been dispatched to ${email}.`,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to initiate password reset.");
  }
}

async function resetPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
    const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";

    if (!email || !otp || !newPassword || newPassword.length < 4) {
      return res.status(400).send({
        success: false,
        message: "Email, OTP code and a new password (min 4 characters) are required.",
      });
    }

    const record = global.otpStore.get(email);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).send({
        success: false,
        message: "Invalid or expired OTP code. Please request a new code.",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    // Update password in database (Sequelize beforeUpdate hook automatically hashes it with bcrypt)
    user.password = newPassword;
    await user.save();

    // Invalidate used OTP
    global.otpStore.delete(email);

    return res.send({
      success: true,
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to reset password.");
  }
}

module.exports = {
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
};

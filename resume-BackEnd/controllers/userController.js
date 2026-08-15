"use strict";

const { User } = require("../models");
const sendControllerError = require("../utils/controllerError");
const { cleanText } = require("../utils/validation");

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    tier: user.tier,
    aiCredits: user.aiCredits,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function getMe(req, res) {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    return res.send({ success: true, user: safeUser(user) });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve profile.");
  }
}

async function updateMe(req, res) {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    const updates = {};

    if (req.body.name !== undefined) {
      const name = cleanText(req.body.name, { min: 2, max: 50 });

      if (!name) {
        return res.status(400).send({
          success: false,
          message: "Name must be between 2 and 50 characters.",
        });
      }

      updates.name = name;
    }

    if (req.body.email !== undefined) {
      const email = cleanText(req.body.email, { min: 3, max: 254 });

      if (!email) {
        return res.status(400).send({
          success: false,
          message: "A valid email is required.",
        });
      }

      updates.email = email.toLowerCase();
    }

    await user.update(updates);
    return res.send({
      success: true,
      message: "Profile updated.",
      user: safeUser(user),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to update profile.");
  }
}

async function changePassword(req, res) {
  try {
    const currentPassword = typeof req.body.currentPassword === "string"
      ? req.body.currentPassword
      : "";
    const newPassword = typeof req.body.newPassword === "string"
      ? req.body.newPassword
      : "";

    if (!currentPassword || newPassword.length < 8 || newPassword.length > 100) {
      return res.status(400).send({
        success: false,
        message: "Current password and an 8-100 character new password are required.",
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user || !(await user.checkPassword(currentPassword))) {
      return res.status(401).send({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.send({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to change password.");
  }
}

async function removeMe(req, res) {
  try {
    const password = typeof req.body.password === "string"
      ? req.body.password
      : "";
    const user = await User.findByPk(req.user.id);

    if (!user || !password || !(await user.checkPassword(password))) {
      return res.status(401).send({
        success: false,
        message: "Password confirmation is required.",
      });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    return sendControllerError(res, error, "Failed to delete account.");
  }
}

module.exports = {
  changePassword,
  getMe,
  removeMe,
  updateMe,
};

"use strict";

const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({
      success: false,
      message: "Authentication token is required.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).send({
      success: false,
      message: "Authentication is not configured.",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Authentication token is required.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      audience: "resume-web",
      issuer: "resume-api",
    });

    if (!Number.isInteger(payload.id) || payload.id <= 0) {
      throw new Error("Token does not contain a valid user.");
    }

    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).send({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

module.exports = verifyToken;

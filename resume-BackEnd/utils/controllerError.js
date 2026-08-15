"use strict";

function sendControllerError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error);

  if (error.name === "DocumentContentValidationError") {
    return res.status(400).send({
      success: false,
      message: error.message,
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).send({
      success: false,
      message: error.errors?.[0]?.message || "That value is already in use.",
    });
  }

  if (
    error.name === "SequelizeValidationError" ||
    error.name === "SequelizeForeignKeyConstraintError"
  ) {
    return res.status(400).send({
      success: false,
      message: error.errors?.[0]?.message || "Invalid request data.",
    });
  }

  return res.status(500).send({
    success: false,
    message: fallbackMessage,
  });
}

module.exports = sendControllerError;

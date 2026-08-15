"use strict";

const { positiveInteger } = require("../utils/validation");

function validateDocumentId(req, res, next) {
  if (!positiveInteger(req.params.id)) {
    return res.status(400).send({
      success: false,
      message: "A valid document ID is required.",
    });
  }

  return next();
}

module.exports = validateDocumentId;

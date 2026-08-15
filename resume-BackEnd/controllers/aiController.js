"use strict";

const { cleanText } = require("../utils/validation");

function unavailable(feature) {
  return function featureUnavailable(req, res) {
    const text = cleanText(req.body.text || req.body.prompt, {
      min: 1,
      max: 10000,
    });

    if (!text) {
      return res.status(400).send({
        success: false,
        message: "Text or prompt is required.",
      });
    }

    return res.status(501).send({
      success: false,
      feature,
      message: "AI provider integration is not configured yet.",
    });
  };
}

module.exports = {
  bullets: unavailable("bullets"),
  improveText: unavailable("rewrite"),
  prompt: unavailable("prompt"),
  rewrite: unavailable("rewrite"),
  summary: unavailable("summary"),
};

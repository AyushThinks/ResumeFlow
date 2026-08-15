"use strict";

function cleanText(value, { min = 1, max = 255 } = {}) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.trim();
  return cleaned.length >= min && cleaned.length <= max ? cleaned : null;
}

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function nonNegativeInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function allowedValue(value, allowedValues, aliases = {}) {
  const candidate = aliases[value] || value;
  return allowedValues.includes(candidate) ? candidate : null;
}

function jsonText(value) {
  if (typeof value === "string") {
    const cleaned = value.trim();

    if (!cleaned) {
      return null;
    }

    try {
      const parsed = JSON.parse(cleaned);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? cleaned
        : null;
    } catch (_error) {
      return null;
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return null;
}

module.exports = {
  allowedValue,
  cleanText,
  jsonText,
  nonNegativeInteger,
  positiveInteger,
};

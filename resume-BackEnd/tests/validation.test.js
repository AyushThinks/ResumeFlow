"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  allowedValue,
  cleanText,
  jsonText,
  nonNegativeInteger,
  positiveInteger,
} = require("../utils/validation");

test("cleanText trims valid strings and rejects invalid lengths", () => {
  assert.equal(cleanText("  Resume  ", { min: 2, max: 20 }), "Resume");
  assert.equal(cleanText(" ", { min: 1, max: 20 }), null);
  assert.equal(cleanText("toolong", { min: 1, max: 3 }), null);
  assert.equal(cleanText(42), null);
});

test("integer helpers reject unsafe values", () => {
  assert.equal(positiveInteger("12"), 12);
  assert.equal(positiveInteger(0), null);
  assert.equal(positiveInteger("12.5"), null);
  assert.equal(nonNegativeInteger(0), 0);
  assert.equal(nonNegativeInteger(-1), null);
});

test("allowedValue supports explicit aliases", () => {
  assert.equal(
    allowedValue("cover-letter", ["resume", "cover_letter"], {
      "cover-letter": "cover_letter",
    }),
    "cover_letter",
  );
  assert.equal(allowedValue("other", ["resume"]), null);
});

test("jsonText accepts JSON objects and rejects malformed JSON", () => {
  assert.equal(jsonText({ layout: "sidebar" }), '{"layout":"sidebar"}');
  assert.equal(jsonText('{"layout":"modern"}'), '{"layout":"modern"}');
  assert.equal(jsonText(["sidebar"]), null);
  assert.equal(jsonText("null"), null);
  assert.equal(jsonText("{broken"), null);
});

test("cleanText enforces min password length of 8 chars", () => {
  assert.equal(cleanText("short", { min: 8, max: 100 }), null);
  assert.equal(cleanText("validPass123", { min: 8, max: 100 }), "validPass123");

});

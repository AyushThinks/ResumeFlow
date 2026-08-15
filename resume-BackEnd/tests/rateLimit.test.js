"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const createRateLimit = require("../middleware/rateLimit");

function responseDouble() {
  return {
    body: null,
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
  };
}

test("rate limiter allows the limit and blocks the next request", () => {
  const middleware = createRateLimit({ windowMs: 60000, limit: 2 });
  const req = {
    baseUrl: "/api/auth",
    ip: "127.0.0.1",
    path: "/login",
  };
  let nextCalls = 0;

  const first = responseDouble();
  middleware(req, first, () => {
    nextCalls += 1;
  });

  const second = responseDouble();
  middleware(req, second, () => {
    nextCalls += 1;
  });

  const third = responseDouble();
  middleware(req, third, () => {
    nextCalls += 1;
  });

  assert.equal(nextCalls, 2);
  assert.equal(first.headers["RateLimit-Remaining"], "1");
  assert.equal(second.headers["RateLimit-Remaining"], "0");
  assert.equal(third.statusCode, 429);
  assert.equal(third.headers["RateLimit-Remaining"], "0");
  assert.equal(third.body.success, false);
  assert.ok(third.headers["Retry-After"]);
});

test("rate limiter keeps paths in separate buckets", () => {
  const middleware = createRateLimit({ windowMs: 60000, limit: 1 });
  let nextCalls = 0;

  middleware(
    { baseUrl: "/api/auth", ip: "127.0.0.1", path: "/login" },
    responseDouble(),
    () => {
      nextCalls += 1;
    },
  );
  middleware(
    { baseUrl: "/api/auth", ip: "127.0.0.1", path: "/register" },
    responseDouble(),
    () => {
      nextCalls += 1;
    },
  );

  assert.equal(nextCalls, 2);
});

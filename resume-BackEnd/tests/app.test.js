"use strict";

const assert = require("node:assert/strict");
const http = require("node:http");
const {
  after,
  test,
} = require("node:test");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-production";

const app = require("../app");
const { sequelize } = require("../models");

let server;
let port;

function startServer() {
  if (server) return Promise.resolve();
  return new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      port = server.address().port;
      server.unref();
      resolve();
    });
  });
}

function request(path, options = {}) {
  return startServer().then(() => {
    return new Promise((resolve, reject) => {
      const headers = Object.assign({ Connection: "close" }, options.headers || {});
      if (options.body) {
        headers["Content-Length"] = Buffer.byteLength(options.body);
      }
      const reqOptions = {
        method: options.method || "GET",
        hostname: "127.0.0.1",
        port: port,
        path: path,
        headers: headers,
        agent: false
      };

      const req = http.request(reqOptions, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          let json = null;
          try { json = JSON.parse(data); } catch (_) {}
          resolve({
            status: res.statusCode,
            headers: {
              get: (name) => res.headers[name.toLowerCase()] || null
            },
            json: async () => json,
            text: async () => data
          });
        });
      });

      req.on("error", reject);
      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  });
}

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  try {
    await sequelize.close();
  } catch (_) {}
});

test("unknown routes return JSON 404 with security headers", async () => {
  const response = await request("/api/not-a-route");
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-powered-by"), null);
});

test("protected routes reject requests without a token", async () => {
  const response = await request("/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Improve this line" }),
  });
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
});

test("JSON routes reject unsupported content types", async () => {
  const response = await request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  });

  assert.equal(response.status, 415);
});

test("CORS allowlist rejects an unknown browser origin", async () => {
  const response = await request("/api/not-a-route", {
    headers: { Origin: "https://example.invalid" },
  });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.equal(body.message, "Origin is not allowed by CORS.");
});

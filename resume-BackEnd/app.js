"use strict";

require("dotenv").config({ quiet: true });

const cors = require("cors");
const express = require("express");

const { sequelize } = require("./models");
const routes = require("./routes");

// Prevent server crashing on any unhandled async exceptions
process.on("uncaughtException", (err) => {
  console.error("[CRASH PREVENTED] Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[CRASH PREVENTED] Unhandled Rejection:", reason);
});

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.CLIENT_URL || "https://resume-flow-gilt.vercel.app,http://localhost:4200")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production.");
}

app.disable("x-powered-by");

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
}));

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  const expectsBody = ["POST", "PUT", "PATCH"].includes(req.method);
  const hasBody = Number(req.headers["content-length"] || 0) > 0;

  if (expectsBody && hasBody && !req.is("application/json")) {
    return res.status(415).send({
      success: false,
      message: "Content-Type must be application/json.",
    });
  }

  return next();
});

app.get("/api/health", async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.send({
      success: true,
      service: "resume-api",
      status: "ok",
      database: "connected",
    });
  } catch (_error) {
    return res.status(503).send({
      success: false,
      service: "resume-api",
      status: "degraded",
      database: "unavailable",
    });
  }
});

app.use("/api", routes);

app.use((req, res) => {
  return res.status(404).send({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, _req, res, _next) => {
  if (error.message === "Origin is not allowed by CORS.") {
    return res.status(403).send({
      success: false,
      message: error.message,
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).send({
      success: false,
      message: "Request body contains invalid JSON.",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).send({
      success: false,
      message: "Request body is too large.",
    });
  }

  console.error("Unhandled request error", error);

  return res.status(500).send({
    success: false,
    message: "Internal server error.",
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    const server = app.listen(port, () => {
      console.log(`Resume API running on port ${port}`);
    });

    async function shutdown(signal) {
      console.log(`${signal} received. Closing server.`);
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    }

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Unable to start Resume API:", error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;

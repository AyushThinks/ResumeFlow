"use strict";

function createRateLimit({ windowMs = 15 * 60 * 1000, limit = 20 } = {}) {
  const attempts = new Map();
  let requestCount = 0;

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const key = `${ip}:${req.baseUrl || ""}${req.path || ""}`;
    const current = attempts.get(key);

    requestCount += 1;

    if (requestCount % 200 === 0) {
      for (const [storedKey, value] of attempts) {
        if (value.expiresAt <= now) {
          attempts.delete(storedKey);
        }
      }
    }

    if (!current || current.expiresAt <= now) {
      attempts.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      res.setHeader("RateLimit-Limit", String(limit));
      res.setHeader("RateLimit-Remaining", String(Math.max(limit - 1, 0)));
      res.setHeader("RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));
      return next();
    }

    res.setHeader("RateLimit-Limit", String(limit));
    res.setHeader("RateLimit-Reset", String(Math.ceil(current.expiresAt / 1000)));

    if (current.count >= limit) {
      res.setHeader("RateLimit-Remaining", "0");
      const retryAfter = Math.ceil((current.expiresAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).send({
        success: false,
        message: "Too many attempts. Please try again later.",
      });
    }

    current.count += 1;
    attempts.set(key, current);
    res.setHeader(
      "RateLimit-Remaining",
      String(Math.max(limit - current.count, 0)),
    );
    return next();
  };
}

module.exports = createRateLimit;

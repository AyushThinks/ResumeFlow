"use strict";

const express = require("express");

const aiController = require("../controllers/aiController");
const auth = require("../middleware/auth");
const createRateLimit = require("../middleware/rateLimit");

const router = express.Router();
const aiRateLimit = createRateLimit({
  limit: 30,
  windowMs: 60 * 60 * 1000,
});

router.post("/improve", auth, aiRateLimit, aiController.improveText);
router.post("/bullets", auth, aiRateLimit, aiController.bullets);
router.post("/summary", auth, aiRateLimit, aiController.summary);
router.post("/rewrite", auth, aiRateLimit, aiController.rewrite);
router.post("/prompt", auth, aiRateLimit, aiController.prompt);

module.exports = router;

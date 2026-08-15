"use strict";

const express = require("express");

const templateController = require("../controllers/templateController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", templateController.listAll);
router.get("/:id", templateController.findOne);
router.post("/", auth, templateController.create);

module.exports = router;

"use strict";

const express = require("express");

const versionController = require("../controllers/versionController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, versionController.create);
router.get("/document/:documentId", auth, versionController.listByDocument);
router.get("/documents/:documentId", auth, versionController.listByDocument);
router.post("/:id/restore", auth, versionController.restore);

module.exports = router;

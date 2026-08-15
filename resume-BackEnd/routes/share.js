"use strict";

const express = require("express");

const shareController = require("../controllers/shareController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/public/:slug", shareController.findPublic);
router.get("/", auth, shareController.listByUser);
router.post("/", auth, shareController.create);
router.get("/document/:documentId", auth, shareController.listByDocument);
router.delete("/:id", auth, shareController.remove);

module.exports = router;

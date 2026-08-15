"use strict";

const express = require("express");

const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);
router.put("/me/password", auth, userController.changePassword);
router.delete("/me", auth, userController.removeMe);

module.exports = router;

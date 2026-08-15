const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const createRateLimit = require("../middleware/rateLimit");
const auth = require("../middleware/auth");

const authRateLimit = createRateLimit({ limit: 20, windowMs: 15 * 60 * 1000 });

router.post("/register", authRateLimit, authController.register);
router.post("/login", authRateLimit, authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authRateLimit, authController.forgotPassword);
router.post("/reset-password", authRateLimit, authController.resetPassword);
router.put("/change-password", auth, authRateLimit, userController.changePassword);

module.exports = router;

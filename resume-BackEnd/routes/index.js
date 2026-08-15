const express = require("express");
const router = express.Router();    

// Connect document routes
router.use("/documents", require("./documents"));

// Connect auth routes
router.use("/auth", require("./auth"));

// Connect user profile routes
router.use("/users", require("./user"));

// Connect section routes
router.use("/sections", require("./section"));

// Connect item routes
router.use("/items", require("./item"));

// Connect template routes
router.use("/templates", require("./template"));
    
// Connect share routes
router.use("/shares", require("./share"));

// Connect version routes
router.use("/versions", require("./version"));

// Connect application routes
router.use("/applications", require("./application"));

// Connect AI routes
router.use("/ai", require("./ai"));

// Connect export routes
router.use("/export", require("./export"));
router.use("/exports", require("./export"));

module.exports = router;

const express = require("express");
const router = express.Router();

const sectionController = require("../controllers/sectionController");
const auth = require("../middleware/auth");

router.post("/", auth, sectionController.create);
router.get("/document/:documentId", auth, sectionController.listByDocument);
router.put("/:id", auth, sectionController.update);
router.delete("/:id", auth, sectionController.remove);

module.exports = router;
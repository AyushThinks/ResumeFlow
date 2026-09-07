const express = require("express");
const router = express.Router();

const itemController = require("../controllers/itemController");
const auth = require("../middleware/auth");

router.post("/", auth, itemController.create);
router.get("/section/:sectionId", auth, itemController.listBySection);
router.put("/:id", auth, itemController.update);
router.delete("/:id", auth, itemController.remove);

module.exports = router;
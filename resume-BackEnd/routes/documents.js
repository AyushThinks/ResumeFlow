const express = require("express");
const router = express.Router();

const documentController = require("../controllers/documentController");
const shareController = require("../controllers/shareController");
const versionController = require("../controllers/versionController");
const validate = require("../middleware/documentValidator");

const auth = require("../middleware/auth");

router.get("/", auth, documentController.list);
router.post("/", auth, documentController.create);
router.post("/import", auth, documentController.importDocument);
router.get("/:documentId/versions", auth, versionController.listByDocument);
router.post("/:documentId/versions", auth, versionController.create);
router.post(
  "/:documentId/versions/:versionId/restore",
  auth,
  versionController.restore,
);
router.post("/:documentId/share", auth, shareController.create);
router.get("/:id", auth, validate, documentController.findOne);
router.put("/:id", auth, validate, documentController.update);
router.post("/:id/duplicate", auth, validate, documentController.duplicate);
router.delete("/:id", auth, validate, documentController.remove);

module.exports = router;

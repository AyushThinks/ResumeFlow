"use strict";

const {
  Document,
  Section,
  Version,
  sequelize,
} = require("../models");
const sendControllerError = require("../utils/controllerError");
const {
  createSections,
  loadSections,
  normalizeSections,
} = require("../utils/documentData");
const {
  allowedValue,
  cleanText,
  positiveInteger,
} = require("../utils/validation");

const DOCUMENT_TYPES = ["resume", "cv", "cover_letter"];

function parseSnapshot(value) {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const sections = normalizeSections(parsed.sections);

    if (!sections) {
      return null;
    }

    return {
      document: parsed.document && typeof parsed.document === "object"
        ? parsed.document
        : {},
      sections,
    };
  } catch (_error) {
    return null;
  }
}

async function create(req, res) {
  try {
    const documentId = positiveInteger(
      req.body.documentId || req.params.documentId,
    );
    const document = documentId
      ? await Document.findOne({
          where: { id: documentId, userId: req.user.id },
        })
      : null;

    if (!document) {
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    const label = req.body.label === undefined
      ? `Saved ${new Date().toISOString()}`
      : cleanText(req.body.label, { min: 2, max: 100 });

    if (!label) {
      return res.status(400).send({
        success: false,
        message: "Version label must be between 2 and 100 characters.",
      });
    }

    let snapshot;

    if (req.body.snapshot !== undefined) {
      snapshot = parseSnapshot(req.body.snapshot);

      if (!snapshot) {
        return res.status(400).send({
          success: false,
          message: "Snapshot must contain a valid sections array.",
        });
      }
    } else {
      snapshot = {
        document: {
          title: document.title,
          type: document.type,
          templateId: document.templateId,
        },
        sections: await loadSections(document.id),
      };
    }

    const version = await Version.create({
      documentId,
      label,
      snapshot: JSON.stringify(snapshot),
    });

    return res.status(201).send({
      success: true,
      message: "Version saved.",
      version,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to save version.");
  }
}

async function listByDocument(req, res) {
  try {
    const documentId = positiveInteger(req.params.documentId);
    const document = documentId
      ? await Document.findOne({
          where: { id: documentId, userId: req.user.id },
        })
      : null;

    if (!document) {
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    const versions = await Version.findAll({
      where: { documentId },
      attributes: ["id", "label", "documentId", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.send({
      success: true,
      message: "Retrieved document versions.",
      versions,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve versions.");
  }
}

async function restore(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const versionId = positiveInteger(
      req.params.versionId || req.params.id,
    );
    const version = versionId
      ? await Version.findByPk(versionId, {
          include: [{
            model: Document,
            where: { userId: req.user.id },
            required: true,
          }],
          transaction,
        })
      : null;

    if (!version) {
      await transaction.rollback();
      return res.status(404).send({
        success: false,
        message: "Version not found.",
      });
    }

    if (
      req.params.documentId &&
      Number(req.params.documentId) !== version.documentId
    ) {
      await transaction.rollback();
      return res.status(404).send({
        success: false,
        message: "Version not found for this document.",
      });
    }

    const snapshot = parseSnapshot(version.snapshot);

    if (!snapshot) {
      await transaction.rollback();
      return res.status(409).send({
        success: false,
        message: "This saved version is not restorable.",
      });
    }

    const documentUpdates = {};
    const title = cleanText(snapshot.document.title, { min: 2, max: 120 });
    const type = allowedValue(
      snapshot.document.type,
      DOCUMENT_TYPES,
      { "cover-letter": "cover_letter" },
    );
    const templateId = snapshot.document.templateId === null
      ? null
      : positiveInteger(snapshot.document.templateId);

    if (title) {
      documentUpdates.title = title;
    }

    if (type) {
      documentUpdates.type = type;
    }

    if (snapshot.document.templateId === null || templateId) {
      documentUpdates.templateId = templateId;
    }

    await version.Document.update(documentUpdates, { transaction });
    await Section.destroy({
      where: { documentId: version.documentId },
      transaction,
    });
    await createSections(
      version.documentId,
      snapshot.sections,
      transaction,
    );
    await transaction.commit();

    return res.send({
      success: true,
      message: "Version restored.",
      documentId: version.documentId,
    });
  } catch (error) {
    await transaction.rollback();
    return sendControllerError(res, error, "Failed to restore version.");
  }
}

module.exports = {
  create,
  listByDocument,
  restore,
};

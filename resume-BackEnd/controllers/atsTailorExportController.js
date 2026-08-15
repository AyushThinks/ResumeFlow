"use strict";

const { Document, Export } = require("../models");
const sendControllerError = require("../utils/controllerError");
const { positiveInteger } = require("../utils/validation");

function exportUnavailable(format) {
  return async function createExport(req, res) {
    try {
      const documentId = positiveInteger(req.body.documentId);
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

      return res.status(501).send({
        success: false,
        format,
        message: `${format.toUpperCase()} export service is not configured yet.`,
      });
    } catch (error) {
      return sendControllerError(res, error, "Failed to prepare export.");
    }
  };
}

async function list(req, res) {
  try {
    const exports = await Export.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Document,
        attributes: ["id", "title", "type"],
      }],
      order: [["createdAt", "DESC"]],
    });

    const serializedExports = exports.map((entry) => {
      const data = entry.toJSON();
      data.documentId = data.Document?.id || data.documentId;
      data.documentTitle = data.Document?.title || "Untitled document";
      data.documentType = data.Document?.type || null;
      delete data.Document;
      return data;
    });

    return res.send({
      success: true,
      message: "Retrieved export list.",
      exports: serializedExports,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve exports.");
  }
}

module.exports = {
  exportDocx: exportUnavailable("docx"),
  exportPdf: exportUnavailable("pdf"),
  list,
};

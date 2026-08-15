"use strict";

const crypto = require("crypto");

const {
  Document,
  Share,
  Template,
} = require("../models");
const sendControllerError = require("../utils/controllerError");
const { loadSections } = require("../utils/documentData");
const { positiveInteger } = require("../utils/validation");

function createSlug() {
  return crypto.randomBytes(12).toString("base64url").toLowerCase();
}

function normalizeSlug(value) {
  if (value === undefined || value === null || value === "") {
    return createSlug();
  }

  if (typeof value !== "string") {
    return null;
  }

  const slug = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{2,79}$/.test(slug) ? slug : null;
}

function parseTemplateConfig(value) {
  if (!value) {
    return {};
  }

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch (_error) {
    return {};
  }
}

async function create(req, res) {
  try {
    const documentId = positiveInteger(
      req.body.documentId || req.params.documentId,
    );
    const slug = normalizeSlug(req.body.slug);

    if (!documentId || !slug) {
      return res.status(400).send({
        success: false,
        message: "A valid document ID and optional URL-safe slug are required.",
      });
    }

    const document = await Document.findOne({
      where: { id: documentId, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    const existing = await Share.findOne({ where: { documentId } });

    if (existing) {
      return res.send({
        success: true,
        message: "Share link already exists.",
        share: existing,
      });
    }

    const share = await Share.create({ documentId, slug });

    return res.status(201).send({
      success: true,
      message: "Share link created.",
      share,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create share link.");
  }
}

async function listByUser(req, res) {
  try {
    const shares = await Share.findAll({
      include: [{
        model: Document,
        where: { userId: req.user.id },
        attributes: ["id", "title", "type", "updatedAt"],
        required: true,
      }],
      order: [["updatedAt", "DESC"]],
    });

    return res.send({
      success: true,
      message: "Retrieved share links.",
      shares,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve share links.");
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

    const shares = await Share.findAll({ where: { documentId } });
    return res.send({
      success: true,
      message: "Retrieved document share links.",
      shares,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve share links.");
  }
}

async function findPublic(req, res) {
  try {
    const slug = normalizeSlug(req.params.slug);

    if (!slug) {
      return res.status(404).send({
        success: false,
        message: "Shared document not found.",
      });
    }

    const share = await Share.findOne({
      where: { slug },
      include: [{
        model: Document,
        attributes: ["id", "title", "type", "templateId", "updatedAt"],
        include: [{
          model: Template,
          attributes: ["id", "name", "config"],
        }],
        required: true,
      }],
    });

    if (!share) {
      return res.status(404).send({
        success: false,
        message: "Shared document not found.",
      });
    }

    const document = share.Document.toJSON();
    document.template = document.Template?.name;
    document.templateConfig = parseTemplateConfig(document.Template?.config);
    delete document.Template;
    document.sections = await loadSections(document.id);

    return res.send({
      success: true,
      share: {
        slug: share.slug,
        updatedAt: share.updatedAt,
      },
      document,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve shared document.");
  }
}

async function remove(req, res) {
  try {
    const shareId = positiveInteger(req.params.id);
    const share = shareId
      ? await Share.findByPk(shareId, {
          include: [{
            model: Document,
            where: { userId: req.user.id },
            required: true,
          }],
        })
      : null;

    if (!share) {
      return res.status(404).send({
        success: false,
        message: "Share link not found.",
      });
    }

    await share.destroy();
    return res.status(204).send();
  } catch (error) {
    return sendControllerError(res, error, "Failed to remove share link.");
  }
}

module.exports = {
  create,
  findPublic,
  listByDocument,
  listByUser,
  remove,
};

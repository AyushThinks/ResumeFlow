"use strict";

const { Document, Item, Section } = require("../models");
const sendControllerError = require("../utils/controllerError");
const {
  cleanText,
  nonNegativeInteger,
  positiveInteger,
} = require("../utils/validation");

async function findOwnedSection(id, userId) {
  const sectionId = positiveInteger(id);

  if (!sectionId) {
    return null;
  }

  return Section.findByPk(sectionId, {
    include: [{
      model: Document,
      where: { userId },
      attributes: ["id", "userId"],
      required: true,
    }],
  });
}

async function create(req, res) {
  try {
    const documentId = positiveInteger(req.body.documentId);
    const heading = cleanText(req.body.heading, { min: 2, max: 100 });

    if (!documentId || !heading) {
      return res.status(400).send({
        success: false,
        message: "A valid document ID and section heading are required.",
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

    const highestPosition = await Section.max("position", {
      where: { documentId },
    });
    const requestedPosition = nonNegativeInteger(req.body.position);

    if (req.body.position !== undefined && requestedPosition === null) {
      return res.status(400).send({
        success: false,
        message: "Section position must be a non-negative integer.",
      });
    }

    const position = requestedPosition ?? (
      Number.isInteger(highestPosition) ? highestPosition + 1 : 0
    );

    const section = await Section.create({
      documentId,
      heading,
      position,
      isSidebar: req.body.isSidebar === true,
    });

    return res.status(201).send({
      success: true,
      message: "Section created.",
      section,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create section.");
  }
}

async function listByDocument(req, res) {
  try {
    const documentId = positiveInteger(req.params.documentId);

    if (!documentId) {
      return res.status(400).send({
        success: false,
        message: "A valid document ID is required.",
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

    const rows = await Section.findAll({
      where: { documentId },
      include: [{ model: Item }],
      order: [
        ["position", "ASC"],
        [Item, "position", "ASC"],
      ],
    });
    const sections = rows.map((row) => {
      const section = row.toJSON();
      section.items = section.Items || [];
      delete section.Items;
      return section;
    });

    return res.send({
      success: true,
      message: "Retrieved document sections.",
      sections,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve sections.");
  }
}

async function update(req, res) {
  try {
    const section = await findOwnedSection(req.params.id, req.user.id);

    if (!section) {
      return res.status(404).send({
        success: false,
        message: "Section not found.",
      });
    }

    const updates = {};

    if (req.body.heading !== undefined) {
      const heading = cleanText(req.body.heading, { min: 2, max: 100 });

      if (!heading) {
        return res.status(400).send({
          success: false,
          message: "Heading must be between 2 and 100 characters.",
        });
      }

      updates.heading = heading;
    }

    if (req.body.position !== undefined) {
      const position = nonNegativeInteger(req.body.position);

      if (position === null) {
        return res.status(400).send({
          success: false,
          message: "Section position must be a non-negative integer.",
        });
      }

      updates.position = position;
    }

    if (req.body.isSidebar !== undefined) {
      if (typeof req.body.isSidebar !== "boolean") {
        return res.status(400).send({
          success: false,
          message: "isSidebar must be true or false.",
        });
      }

      updates.isSidebar = req.body.isSidebar;
    }

    await section.update(updates);

    return res.send({
      success: true,
      message: "Section updated.",
      section,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to update section.");
  }
}

async function remove(req, res) {
  try {
    const section = await findOwnedSection(req.params.id, req.user.id);

    if (!section) {
      return res.status(404).send({
        success: false,
        message: "Section not found.",
      });
    }

    await section.destroy();
    return res.status(204).send();
  } catch (error) {
    return sendControllerError(res, error, "Failed to remove section.");
  }
}

module.exports = {
  create,
  listByDocument,
  remove,
  update,
};

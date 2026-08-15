"use strict";

const { Document, Item, Section } = require("../models");
const sendControllerError = require("../utils/controllerError");
const {
  cleanText,
  nonNegativeInteger,
  positiveInteger,
} = require("../utils/validation");

async function findOwnedSection(sectionIdValue, userId) {
  const sectionId = positiveInteger(sectionIdValue);

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

async function findOwnedItem(itemIdValue, userId) {
  const itemId = positiveInteger(itemIdValue);

  if (!itemId) {
    return null;
  }

  return Item.findByPk(itemId, {
    include: [{
      model: Section,
      required: true,
      include: [{
        model: Document,
        where: { userId },
        attributes: ["id", "userId"],
        required: true,
      }],
    }],
  });
}

async function create(req, res) {
  try {
    const sectionId = positiveInteger(req.body.sectionId);
    const content = cleanText(req.body.content, { min: 1, max: 5000 });

    if (!sectionId || !content) {
      return res.status(400).send({
        success: false,
        message: "A valid section ID and item content are required.",
      });
    }

    const section = await findOwnedSection(sectionId, req.user.id);

    if (!section) {
      return res.status(404).send({
        success: false,
        message: "Section not found.",
      });
    }

    const highestPosition = await Item.max("position", {
      where: { sectionId },
    });
    const requestedPosition = nonNegativeInteger(req.body.position);

    if (req.body.position !== undefined && requestedPosition === null) {
      return res.status(400).send({
        success: false,
        message: "Item position must be a non-negative integer.",
      });
    }

    const position = requestedPosition ?? (
      Number.isInteger(highestPosition) ? highestPosition + 1 : 0
    );
    const item = await Item.create({ sectionId, content, position });

    return res.status(201).send({
      success: true,
      message: "Item created.",
      item,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create item.");
  }
}

async function listBySection(req, res) {
  try {
    const sectionId = positiveInteger(req.params.sectionId);
    const section = await findOwnedSection(sectionId, req.user.id);

    if (!section) {
      return res.status(404).send({
        success: false,
        message: "Section not found.",
      });
    }

    const items = await Item.findAll({
      where: { sectionId },
      order: [["position", "ASC"]],
    });

    return res.send({
      success: true,
      message: "Retrieved section items.",
      items,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve items.");
  }
}

async function update(req, res) {
  try {
    const item = await findOwnedItem(req.params.id, req.user.id);

    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Item not found.",
      });
    }

    const updates = {};

    if (req.body.content !== undefined) {
      const content = cleanText(req.body.content, { min: 1, max: 5000 });

      if (!content) {
        return res.status(400).send({
          success: false,
          message: "Content must be between 1 and 5000 characters.",
        });
      }

      updates.content = content;
    }

    if (req.body.position !== undefined) {
      const position = nonNegativeInteger(req.body.position);

      if (position === null) {
        return res.status(400).send({
          success: false,
          message: "Item position must be a non-negative integer.",
        });
      }

      updates.position = position;
    }

    await item.update(updates);

    return res.send({
      success: true,
      message: "Item updated.",
      item,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to update item.");
  }
}

async function remove(req, res) {
  try {
    const item = await findOwnedItem(req.params.id, req.user.id);

    if (!item) {
      return res.status(404).send({
        success: false,
        message: "Item not found.",
      });
    }

    await item.destroy();
    return res.status(204).send();
  } catch (error) {
    return sendControllerError(res, error, "Failed to remove item.");
  }
}

module.exports = {
  create,
  listBySection,
  remove,
  update,
};

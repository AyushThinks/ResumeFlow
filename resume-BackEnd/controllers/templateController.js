"use strict";

const { Template } = require("../models");
const sendControllerError = require("../utils/controllerError");
const {
  cleanText,
  jsonText,
  positiveInteger,
} = require("../utils/validation");

function serializeTemplate(template) {
  const data = template.toJSON();

  try {
    data.config = JSON.parse(data.config);
  } catch (_error) {
    data.config = {};
  }

  return data;
}

async function create(req, res) {
  try {
    const name = cleanText(req.body.name, { min: 2, max: 100 });
    const config = jsonText(req.body.config);

    if (!name || !config) {
      return res.status(400).send({
        success: false,
        message: "A valid template name and JSON configuration are required.",
      });
    }

    const existing = await Template.findOne({ where: { name } });

    if (existing) {
      return res.status(409).send({
        success: false,
        message: "A template with this name already exists.",
      });
    }

    const template = await Template.create({ name, config });
    return res.status(201).send({
      success: true,
      message: "Template created.",
      template: serializeTemplate(template),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create template.");
  }
}

async function listAll(_req, res) {
  try {
    const templates = await Template.findAll({
      order: [["name", "ASC"]],
    });

    return res.send({
      success: true,
      message: "Retrieved templates.",
      templates: templates.map(serializeTemplate),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve templates.");
  }
}

async function findOne(req, res) {
  try {
    const templateId = positiveInteger(req.params.id);
    const template = templateId
      ? await Template.findByPk(templateId)
      : null;

    if (!template) {
      return res.status(404).send({
        success: false,
        message: "Template not found.",
      });
    }

    return res.send({
      success: true,
      template: serializeTemplate(template),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve template.");
  }
}

module.exports = {
  create,
  findOne,
  listAll,
};

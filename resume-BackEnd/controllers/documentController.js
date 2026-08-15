"use strict";

const {
  Document,
  Section,
  Template,
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

const STARTER_SECTIONS = [
  {
    heading: "Contact",
    sidebar: true,
    items: ["City, State, Country", "+91 00000 00000", "you@example.com"],
  },
  {
    heading: "Technical Skills",
    sidebar: true,
    items: ["Angular", "Node.js", "Express.js", "MySQL", "Git"],
  },
  {
    heading: "Languages",
    sidebar: true,
    items: ["Hindi - Native", "English - Fluent"],
  },
  {
    heading: "Profile",
    sidebar: false,
    items: ["Write two or three lines about what you do and what you are good at."],
  },
  {
    heading: "Work Experience",
    sidebar: false,
    items: [
      "Company Name, City (2022 - 2024)",
      "Describe your contribution and impact in one line.",
    ],
  },
  {
    heading: "Education",
    sidebar: false,
    items: ["Your Degree, University (2018 - 2022)"],
  },
  {
    heading: "Projects",
    sidebar: false,
    items: ["Project name - technology used and measurable outcome."],
  },
];

function normalizeDocumentType(value) {
  return allowedValue(value, DOCUMENT_TYPES, {
    "cover-letter": "cover_letter",
  });
}

function parseTemplateConfig(template) {
  if (!template) {
    return {};
  }

  try {
    return typeof template.config === "string"
      ? JSON.parse(template.config)
      : template.config || {};
  } catch (_error) {
    return {};
  }
}

function isSidebarTemplate(template) {
  const config = parseTemplateConfig(template);
  return config.layout === "sidebar" || /sidebar/i.test(template?.name || "");
}

function serializeDocument(document) {
  const data = document.toJSON();

  if (data.Template) {
    data.template = data.Template.name;
    data.templateConfig = parseTemplateConfig(data.Template);
  }

  delete data.Template;
  return data;
}

async function resolveTemplate({ templateId, templateName, transaction }) {
  if (templateId !== undefined && templateId !== null && templateId !== "") {
    const id = positiveInteger(templateId);

    if (!id) {
      return { error: "Template ID must be a positive integer." };
    }

    const template = await Template.findByPk(id, { transaction });
    return template
      ? { template }
      : { error: "Template not found." };
  }

  if (templateName === undefined || templateName === null || templateName === "") {
    return { template: null };
  }

  const name = cleanText(templateName, { min: 2, max: 100 });

  if (!name) {
    return { error: "Template name must be between 2 and 100 characters." };
  }

  const layout = /sidebar/i.test(name) ? "sidebar" : name.toLowerCase();
  const [template] = await Template.findOrCreate({
    where: { name },
    defaults: { config: JSON.stringify({ layout }) },
    transaction,
  });

  return { template };
}

function starterSectionsFor(template) {
  const useSidebar = isSidebarTemplate(template);

  return STARTER_SECTIONS.map((section) => ({
    heading: section.heading,
    items: section.items,
    isSidebar: useSidebar && section.sidebar,
  }));
}

async function list(req, res) {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      include: [{ model: Template, attributes: ["id", "name", "config"] }],
      order: [["updatedAt", "DESC"]],
    });

    return res.send({
      success: true,
      message: "Retrieved the list of documents.",
      documents: documents.map(serializeDocument),
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve documents.");
  }
}

async function create(req, res) {
  const title = cleanText(req.body.title, { min: 2, max: 120 });
  const type = normalizeDocumentType(req.body.type || "resume");
  const suppliedSections = req.body.sections;

  if (!title || !type) {
    return res.status(400).send({
      success: false,
      message: "A valid title and document type are required.",
    });
  }

  if (suppliedSections !== undefined && !normalizeSections(suppliedSections)) {
    return res.status(400).send({
      success: false,
      message: "Document sections are invalid.",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const templateResult = await resolveTemplate({
      templateId: req.body.templateId,
      templateName: req.body.template,
      transaction,
    });

    if (templateResult.error) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        message: templateResult.error,
      });
    }

    const template = templateResult.template;
    const document = await Document.create(
      {
        title,
        type,
        userId: req.user.id,
        templateId: template?.id || null,
      },
      { transaction },
    );

    if (suppliedSections !== undefined) {
      await createSections(document.id, suppliedSections, transaction);
    } else if (template) {
      await createSections(
        document.id,
        starterSectionsFor(template),
        transaction,
      );
    }

    await transaction.commit();

    return res.status(201).send({
      success: true,
      message: "Document created.",
      document: {
        ...document.toJSON(),
        template: template?.name,
        templateConfig: parseTemplateConfig(template),
      },
    });
  } catch (error) {
    await transaction.rollback();
    return sendControllerError(res, error, "Failed to create document.");
  }
}

async function findOne(req, res) {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Template, attributes: ["id", "name", "config"] }],
    });

    if (!document) {
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    const sections = await loadSections(document.id);

    return res.send({
      success: true,
      message: "Retrieved the document.",
      document: {
        ...serializeDocument(document),
        sections,
      },
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve document.");
  }
}

async function update(req, res) {
  if (
    req.body.sections !== undefined &&
    !normalizeSections(req.body.sections)
  ) {
    return res.status(400).send({
      success: false,
      message: "Document sections are invalid.",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction,
    });

    if (!document) {
      await transaction.rollback();
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    const updates = {};
    if (req.body.title !== undefined) {
      const title = cleanText(req.body.title, { min: 2, max: 120 });

      if (!title) {
        await transaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Title must be between 2 and 120 characters.",
        });
      }

      updates.title = title;
    }

    if (req.body.type !== undefined) {
      const type = normalizeDocumentType(req.body.type);

      if (!type) {
        await transaction.rollback();
        return res.status(400).send({
          success: false,
          message: "Invalid document type.",
        });
      }

      updates.type = type;
    }

    if (req.body.templateId !== undefined || req.body.template !== undefined) {
      const templateResult = await resolveTemplate({
        templateId: req.body.templateId,
        templateName: req.body.template,
        transaction,
      });

      if (templateResult.error) {
        await transaction.rollback();
        return res.status(400).send({
          success: false,
          message: templateResult.error,
        });
      }

      updates.templateId = templateResult.template?.id || null;
    }

    await document.update(updates, { transaction });

    if (req.body.sections !== undefined) {
      await Section.destroy({
        where: { documentId: document.id },
        transaction,
      });
      await createSections(document.id, req.body.sections, transaction);
    }

    await transaction.commit();

    const updatedDocument = await Document.findByPk(document.id, {
      include: [{ model: Template, attributes: ["id", "name", "config"] }],
    });

    return res.send({
      success: true,
      message: "Document updated.",
      document: serializeDocument(updatedDocument),
    });
  } catch (error) {
    await transaction.rollback();
    return sendControllerError(res, error, "Failed to update document.");
  }
}

async function remove(req, res) {
  try {
    const document = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!document) {
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    await document.destroy();
    return res.status(204).send();
  } catch (error) {
    return sendControllerError(res, error, "Failed to remove document.");
  }
}

async function duplicate(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const source = await Document.findOne({
      where: { id: req.params.id, userId: req.user.id },
      transaction,
    });

    if (!source) {
      await transaction.rollback();
      return res.status(404).send({
        success: false,
        message: "Document not found.",
      });
    }

    const sourceSections = await loadSections(source.id, transaction);
    const copyTitle = `${source.title.slice(0, 113)} (Copy)`;
    const copy = await Document.create(
      {
        title: copyTitle,
        type: source.type,
        userId: req.user.id,
        templateId: source.templateId,
      },
      { transaction },
    );

    await createSections(copy.id, sourceSections, transaction);
    await transaction.commit();

    return res.status(201).send({
      success: true,
      message: "Document and its content duplicated.",
      document: copy,
    });
  } catch (error) {
    await transaction.rollback();
    return sendControllerError(res, error, "Failed to duplicate document.");
  }
}

async function importDocument(req, res) {
  const title = cleanText(req.body.title, { min: 2, max: 120 });
  const type = normalizeDocumentType(req.body.type || "resume");

  if (!title || !type || !normalizeSections(req.body.sections)) {
    return res.status(400).send({
      success: false,
      message: "A valid title, type and sections array are required.",
    });
  }

  const transaction = await sequelize.transaction();

  try {
    const templateResult = await resolveTemplate({
      templateId: req.body.templateId,
      templateName: req.body.template,
      transaction,
    });

    if (templateResult.error) {
      await transaction.rollback();
      return res.status(400).send({
        success: false,
        message: templateResult.error,
      });
    }

    const template = templateResult.template;
    const document = await Document.create(
      {
        title,
        type,
        userId: req.user.id,
        templateId: template?.id || null,
      },
      { transaction },
    );

    await createSections(document.id, req.body.sections, transaction);
    await transaction.commit();

    return res.status(201).send({
      success: true,
      message: "Structured document imported.",
      document,
    });
  } catch (error) {
    await transaction.rollback();
    return sendControllerError(res, error, "Failed to import document.");
  }
}

module.exports = {
  create,
  duplicate,
  findOne,
  importDocument,
  list,
  remove,
  update,
};

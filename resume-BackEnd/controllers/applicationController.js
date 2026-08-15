"use strict";

const { Application, Document } = require("../models");
const sendControllerError = require("../utils/controllerError");
const {
  allowedValue,
  cleanText,
  positiveInteger,
} = require("../utils/validation");

const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

function parseDate(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

async function create(req, res) {
  try {
    const documentId = positiveInteger(req.body.documentId);
    const company = cleanText(req.body.company, { min: 2, max: 100 });
    const role = cleanText(req.body.role, { min: 2, max: 100 });
    const status = allowedValue(
      req.body.status || "saved",
      APPLICATION_STATUSES,
    );
    const suppliedDate = parseDate(req.body.appliedAt);

    if (!documentId || !company || !role || !status || suppliedDate === undefined) {
      return res.status(400).send({
        success: false,
        message: "A valid document, company, role, status and date are required.",
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

    const application = await Application.create({
      userId: req.user.id,
      documentId,
      company,
      role,
      status,
      appliedAt: suppliedDate || (status === "saved" ? null : new Date()),
    });

    return res.status(201).send({
      success: true,
      message: "Application created.",
      application,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to create application.");
  }
}

async function listByUser(req, res) {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      include: [{ model: Document, attributes: ["id", "title", "type"] }],
      order: [["updatedAt", "DESC"]],
    });

    return res.send({
      success: true,
      message: "Retrieved applications.",
      applications,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to retrieve applications.");
  }
}

async function update(req, res) {
  try {
    const applicationId = positiveInteger(req.params.id);
    const application = applicationId
      ? await Application.findOne({
          where: { id: applicationId, userId: req.user.id },
        })
      : null;

    if (!application) {
      return res.status(404).send({
        success: false,
        message: "Application not found.",
      });
    }

    const updates = {};

    if (req.body.company !== undefined) {
      const company = cleanText(req.body.company, { min: 2, max: 100 });

      if (!company) {
        return res.status(400).send({
          success: false,
          message: "Company must be between 2 and 100 characters.",
        });
      }

      updates.company = company;
    }

    if (req.body.role !== undefined) {
      const role = cleanText(req.body.role, { min: 2, max: 100 });

      if (!role) {
        return res.status(400).send({
          success: false,
          message: "Role must be between 2 and 100 characters.",
        });
      }

      updates.role = role;
    }

    if (req.body.status !== undefined) {
      const status = allowedValue(req.body.status, APPLICATION_STATUSES);

      if (!status) {
        return res.status(400).send({
          success: false,
          message: "Invalid application status.",
        });
      }

      updates.status = status;

      if (status !== "saved" && !application.appliedAt && req.body.appliedAt === undefined) {
        updates.appliedAt = new Date();
      }
    }

    if (req.body.appliedAt !== undefined) {
      const appliedAt = parseDate(req.body.appliedAt);

      if (appliedAt === undefined) {
        return res.status(400).send({
          success: false,
          message: "Invalid application date.",
        });
      }

      updates.appliedAt = appliedAt;
    }

    if (req.body.documentId !== undefined) {
      const documentId = positiveInteger(req.body.documentId);
      const document = documentId
        ? await Document.findOne({
            where: { id: documentId, userId: req.user.id },
          })
        : null;

      if (!document) {
        return res.status(400).send({
          success: false,
          message: "Invalid document.",
        });
      }

      updates.documentId = documentId;
    }

    await application.update(updates);

    return res.send({
      success: true,
      message: "Application updated.",
      application,
    });
  } catch (error) {
    return sendControllerError(res, error, "Failed to update application.");
  }
}

async function remove(req, res) {
  try {
    const applicationId = positiveInteger(req.params.id);
    const application = applicationId
      ? await Application.findOne({
          where: { id: applicationId, userId: req.user.id },
        })
      : null;

    if (!application) {
      return res.status(404).send({
        success: false,
        message: "Application not found.",
      });
    }

    await application.destroy();
    return res.status(204).send();
  } catch (error) {
    return sendControllerError(res, error, "Failed to remove application.");
  }
}

module.exports = {
  create,
  listByUser,
  remove,
  update,
};

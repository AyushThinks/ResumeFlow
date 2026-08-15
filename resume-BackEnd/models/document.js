'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.User, {
        foreignKey: "userId",
      });

      Document.belongsTo(models.Template, {
        foreignKey: "templateId",
      });

      Document.hasMany(models.Section, {
        foreignKey: "documentId",
        onDelete: "CASCADE",
      });

      Document.hasMany(models.Application, {
        foreignKey: "documentId",
        onDelete: "CASCADE",
      });

      Document.hasMany(models.Version, {
        foreignKey: "documentId",
        onDelete: "CASCADE",
      });

      Document.hasOne(models.Share, {
        foreignKey: "documentId",
        onDelete: "CASCADE",
      });

      Document.hasMany(models.Export, {
        foreignKey: "documentId",
        onDelete: "CASCADE",
      });
    }
  }

  Document.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Title is required",
          },
          len: {
            args: [2, 120],
            msg: "Title must be between 2 and 120 characters",
          },
        },
      },

      type: {
        type: DataTypes.ENUM("resume", "cv", "cover_letter"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["resume", "cv", "cover_letter"]],
            msg: "Type must be resume, cv or cover_letter",
          },
        },
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "User ID must be an integer",
          },
        },
      },

      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: "Template ID must be an integer",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Document",
      indexes: [
        { fields: ["userId", "updatedAt"] },
        { fields: ["templateId"] },
      ],
    }
  );

  return Document;
};

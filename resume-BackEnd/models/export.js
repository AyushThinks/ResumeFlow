'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Export extends Model {
    static associate(models) {
      Export.belongsTo(models.User, {
        foreignKey: "userId",
      });

      Export.belongsTo(models.Document, {
        foreignKey: "documentId",
      });
    }
  }

  Export.init(
    {
      format: {
        type: DataTypes.ENUM("pdf", "docx"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["pdf", "docx"]],
            msg: "Format must be either pdf or docx",
          },
        },
      },

      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "File URL is required",
          },
          isUrl: {
            msg: "Please enter a valid URL",
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

      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Document ID must be an integer",
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Export',
      indexes: [
        { fields: ["userId", "createdAt"] },
        { fields: ["documentId"] },
      ],
    }
  );

  return Export;
};

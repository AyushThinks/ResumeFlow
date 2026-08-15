'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, {
        foreignKey: "userId",
      });

      Application.belongsTo(models.Document, {
        foreignKey: "documentId",
      });
    }
  }

  Application.init(
    {
      company: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Company name is required",
          },
          len: {
            args: [2, 100],
            msg: "Company name must be between 2 and 100 characters",
          },
        },
      },

      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Role is required",
          },
          len: {
            args: [2, 100],
            msg: "Role must be between 2 and 100 characters",
          },
        },
      },

      status: {
        type: DataTypes.ENUM(
          "saved",
          "applied",
          "interview",
          "offer",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "saved",
        validate: {
          isIn: {
            args: [[
              "saved",
              "applied",
              "interview",
              "offer",
              "rejected",
            ]],
            msg: "Invalid application status",
          },
        },
      },

      appliedAt: {
        type: DataTypes.DATE,
        allowNull: true,
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
      modelName: "Application",
      indexes: [
        { fields: ["userId", "status"] },
        { fields: ["documentId"] },
      ],
    }
  );

  return Application;
};

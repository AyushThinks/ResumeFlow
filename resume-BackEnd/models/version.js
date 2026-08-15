'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Version extends Model {
    static associate(models) {
      Version.belongsTo(models.Document, {
        foreignKey: "documentId",
      });
    }
  }

  Version.init(
    {
      snapshot: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Snapshot is required",
          },
        },
      },

      label: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Label is required",
          },
          len: {
            args: [2, 100],
            msg: "Label must be between 2 and 100 characters",
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
      modelName: 'Version',
      indexes: [{ fields: ["documentId", "createdAt"] }],
    }
  );

  return Version;
};

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Share extends Model {
    static associate(models) {
      Share.belongsTo(models.Document, {
        foreignKey: "documentId",
      });
    }
  }

  Share.init(
    {
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Slug is required",
          },
          len: {
            args: [3, 255],
            msg: "Slug must be between 3 and 255 characters",
          },
        },
      },

      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          isInt: {
            msg: "Document ID must be an integer",
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Share',
    }
  );

  return Share;
};
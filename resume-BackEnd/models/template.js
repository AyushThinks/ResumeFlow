'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Template extends Model {
    static associate(models) {
      Template.hasMany(models.Document, {
        foreignKey: "templateId",
        onDelete: "SET NULL",
      });
    }
  }

  Template.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Template name is required",
          },
          len: {
            args: [2, 100],
            msg: "Template name must be between 2 and 100 characters",
          },
        },
      },

      config: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Template configuration is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Template',
    }
  );

  return Template;
};
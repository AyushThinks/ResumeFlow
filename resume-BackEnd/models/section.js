'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Section extends Model {
    static associate(models) {
      Section.belongsTo(models.Document, {
        foreignKey: "documentId",
      });

      Section.hasMany(models.Item, {
        foreignKey: "sectionId",
        onDelete: "CASCADE",
      });
    }
  }

  Section.init(
    {
      heading: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Heading is required",
          },
          len: {
            args: [2, 100],
            msg: "Heading must be between 2 and 100 characters",
          },
        },
      },

      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Position must be an integer",
          },
          min: {
            args: [0],
            msg: "Position cannot be negative",
          },
        },
      },

      isSidebar: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'Section',
      indexes: [{ fields: ["documentId", "position"] }],
    }
  );

  return Section;
};

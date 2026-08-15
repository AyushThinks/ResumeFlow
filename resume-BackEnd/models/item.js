'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      Item.belongsTo(models.Section, {
        foreignKey: "sectionId",
      });
    }
  }

  Item.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Content is required",
          },
          len: {
            args: [1, 5000],
            msg: "Content must be between 1 and 5000 characters",
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

      sectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Section ID must be an integer",
          },
        },
      },
    },
    {
      sequelize,
      modelName: 'Item',
      indexes: [{ fields: ["sectionId", "position"] }],
    }
  );

  return Item;
};

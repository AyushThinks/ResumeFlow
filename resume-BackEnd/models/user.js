'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Document, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });

      User.hasMany(models.Application, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });

      User.hasMany(models.Export, {
        foreignKey: "userId",
        onDelete: "CASCADE",
      });
    }

    checkPassword(plainText) {
      return bcrypt.compare(plainText, this.password);
    }

    toSafeJSON() {
      const values = this.toJSON();
      delete values.password;
      return values;
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name is required",
          },
          len: {
            args: [2, 50],
            msg: "Name must be between 2 and 50 characters",
          },
        },
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Please enter a valid email address",
          },
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password is required",
          },
          len: {
            args: [8, 100],
            msg: "Password must be at least 8 characters long",
          },
        },
      },

      tier: {
        type: DataTypes.ENUM("free", "pro"),
        allowNull: false,
        defaultValue: "free",
        validate: {
          isIn: {
            args: [["free", "pro"]],
            msg: "Tier must be either free or pro",
          },
        },
      },

      aiCredits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: {
            args: [0],
            msg: "AI credits cannot be negative",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      indexes: [{ unique: true, fields: ["email"] }],
    }
  );

  async function hashChangedPassword(user) {
    if (!user.changed("password")) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  User.beforeValidate((user) => {
    if (typeof user.email === "string") {
      user.email = user.email.trim().toLowerCase();
    }
  });
  User.beforeCreate(hashChangedPassword);
  User.beforeUpdate(hashChangedPassword);

  return User;
};

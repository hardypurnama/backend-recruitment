const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      foto: {
        type: DataTypes.STRING,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nohp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tgl_lahir: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      domisili: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      document: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
    }
  );
  return User;
};

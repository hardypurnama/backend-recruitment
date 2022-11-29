const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const Kandidat = sequelize.define(
    "Kandidat",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_lowongan: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_hr: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: "kandidats",
    }
  );
  return Kandidat;
};

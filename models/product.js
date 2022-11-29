const { DataTypes } = require("sequelize");
const { sequelize } = require(".");

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      poster: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nama_perusahaan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      posisi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lokasi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "products",
    }
  );
  return Product;
};

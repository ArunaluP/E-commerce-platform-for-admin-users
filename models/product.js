import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./category.js";

const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    category_id: { type: DataTypes.INTEGER, references: { model: Category, key: "id" } },
  },
  { freezeTableName: true, timestamps: false }
);

Product.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Product, { foreignKey: "category_id" });

export default Product;

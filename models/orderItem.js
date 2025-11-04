import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Order from "./order.js";
import Product from "./product.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.INTEGER, references: { model: Order, key: "id" } },
    product_id: { type: DataTypes.INTEGER, references: { model: Product, key: "id" } },
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
  },
  { freezeTableName: true, timestamps: false }
);

OrderItem.belongsTo(Order, { foreignKey: "order_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });

export default OrderItem;

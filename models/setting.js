import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Setting = sequelize.define(
  "Setting",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: DataTypes.STRING,
    value: DataTypes.STRING,
  },
  { freezeTableName: true, timestamps: false }
);

export default Setting;

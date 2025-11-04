import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        // Only hash if password is plain text (not already hashed)
        if (user.password && !user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
          console.log("🔐 [Sequelize Hook] Hashing password for new user:", user.email);
          user.password = await bcrypt.hash(user.password, 10);
          console.log("✅ [Sequelize Hook] Password hashed successfully");
        }
      },
      beforeUpdate: async (user) => {
        // Only hash if password changed and not already hashed
        if (user.changed("password") && user.password && !user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
          console.log("🔐 [Sequelize Hook] Hashing updated password for user:", user.email);
          user.password = await bcrypt.hash(user.password, 10);
          console.log("✅ [Sequelize Hook] Password hashed successfully");
        }
      },
    },
  }
);

export default User;
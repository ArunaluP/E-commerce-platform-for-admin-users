import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// ✅ Use DATABASE_URL for cloud-hosted PostgreSQL (e.g., Supabase, Render, Neon)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // needed for most hosted databases
    },
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;


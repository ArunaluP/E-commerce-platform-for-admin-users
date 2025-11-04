import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Product from "../models/product.js";
import Category from "../models/category.js";
import Setting from "../models/setting.js";
import sequelize from "../config/db.js";

AdminJS.registerAdapter(AdminJSSequelize);

// Role-based access control helper
const isAdmin = (currentAdmin) => currentAdmin && currentAdmin.role === "admin";
const isUser = (currentAdmin) => currentAdmin && currentAdmin.role === "user";

// AdminJS configuration with RBAC
const adminJs = new AdminJS({
  databases: [sequelize],
  rootPath: "/admin",
  branding: {
    companyName: "E-Commerce Admin Panel",
    logo: false,
    theme: {
      colors: { primary100: "#004080", accent: "#0099ff" },
    },
  },
  resources: [
    // User Resource - Admin only
    {
      resource: User,
    options: {
      parent: null,
      isAccessible: ({ currentAdmin }) => !!currentAdmin,
      isVisible: ({ currentAdmin }) => !!currentAdmin,
      properties: {
        password: { isVisible: false },
        role: {
          isVisible: ({ currentAdmin }) => isAdmin(currentAdmin),
          type: "select",
          availableValues: [
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" },
          ],
        },
      },
      actions: {
        new: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
        delete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
        bulkDelete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
        show: {
          isAccessible: ({ currentAdmin, record }) =>
            isAdmin(currentAdmin) || record?.params?.id == currentAdmin?.id,
        },
        edit: {
          isAccessible: ({ currentAdmin, record }) =>
            isAdmin(currentAdmin) || record?.params?.id == currentAdmin?.id,
        },
        list: {
          isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin),
        },
      },
      before: {
        new: async (request) => {
          if (request.payload?.password) {
            request.payload.password = await bcrypt.hash(request.payload.password, 10);
          }
          return request;
        },
        edit: async (request) => {
          if (request.payload?.password) {
            request.payload.password = await bcrypt.hash(request.payload.password, 10);
          } else {
            delete request.payload.password;
          }
          return request;
        },
      },
    },
  },

    // Category Resource - Admin can manage, users can view
    {
      resource: Category,
      options: {
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        isVisible: ({ currentAdmin }) => isAdmin(currentAdmin),
        actions: {
          new: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          edit: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          delete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          show: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          bulkDelete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          list: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
        },
      },
    },

    // Product Resource - Admin can manage, users can view
    {
      resource: Product,
      options: {
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        isVisible: ({ currentAdmin }) => isAdmin(currentAdmin),
        actions: {
          new: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          edit: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          delete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          show: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          bulkDelete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          list: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
        },
      },
    },

    // Order Resource - Admin can manage all, users can see their own
    {
      resource: Order,
      options: {
        isAccessible: ({ currentAdmin }) => !!currentAdmin,
        isVisible: ({ currentAdmin }) => isAdmin(currentAdmin),
        actions: {
          new: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          edit: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          delete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          show: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
          bulkDelete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          list: { isAccessible: ({ currentAdmin }) => !!currentAdmin },
        },
      },
    },

    // OrderItem Resource - Admin only
    {
      resource: OrderItem,
      options: {
        isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin),
        isVisible: ({ currentAdmin }) => isAdmin(currentAdmin),
        actions: {
          new: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          edit: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          delete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          show: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          bulkDelete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          list: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
        },
      },
    },

    // Setting Resource - Admin only
    {
      resource: Setting,
      options: {
        isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin),
        isVisible: ({ currentAdmin }) => isAdmin(currentAdmin),
        actions: {
          new: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          edit: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          delete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          show: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          bulkDelete: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
          list: { isAccessible: ({ currentAdmin }) => isAdmin(currentAdmin) },
        },
      },
    },
  ],
});

// Export authenticated router with session-based authentication
export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      const user = await User.findOne({ where: { email } });
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return null;

      // Return user object for role-based access control
      return user;
    },
    cookieName: "adminjs",
    cookiePassword: process.env.JWT_SECRET || "your-secret-key",
  }
);

export default adminJs;

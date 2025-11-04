import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.js";
import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Product from "../models/product.js";


dotenv.config();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

  
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      is_active: true,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: "User account is deactivated" });
    }

    // 3️⃣ Compare passwords (bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5️⃣ Send response
    res.json({
      message: "Login successful",
      token,
     
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Basic User Info
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "role", "is_active", "created_at"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2️⃣ Recent Orders (latest 5)
    const recentOrders = await Order.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 5,
      attributes: ["id", "total_amount", "status", "created_at"],
      include: [
        {
          model: OrderItem,
          attributes: ["id", "quantity", "price"],
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    // 3️⃣ Spending Summary
    const orders = await Order.findAll({
      where: { user_id: userId },
      attributes: ["total_amount"],
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // 4️⃣ Activity (Optional)
    const activity = recentOrders.map((order) => ({
      message: `Order #${order.id} placed on ${order.created_at.toISOString().split("T")[0]}`,
      status: order.status,
    }));

    // ✅ Final Response
    res.json({
      profile: user,
      recentOrders,
      summary: {
        totalOrders,
        totalSpent,
        averageOrderValue,
      },
      activity,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    // no hashing — save raw password temporarily
    const user = await User.create({ name, email, password, role });

    // don't return password
    const { password: _, ...u } = user.toJSON();
    res.status(201).json({ message: "User created", data: u });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const deactivateUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.is_active = false;
  await user.save();
  res.json({ message: "User deactivated" });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (password) user.password = password; // no hashing
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    const { password: _, ...u } = user.toJSON();
    res.json({ message: "User updated", data: u });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

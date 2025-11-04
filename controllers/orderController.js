import Order from "../models/order.js";
import OrderItem from "../models/orderItem.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import sequelize from "../config/db.js";

// 🟢 Create a new order
export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "user_id and items are required" });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid user_id" });
    }

    // Create base order
    const order = await Order.create(
      { user_id, total_amount: 0, status: "pending" },
      { transaction: t }
    );

    let total = 0;

    // Add items
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await t.rollback();
        return res.status(400).json({ error: `Invalid productId ${item.productId}` });
      }

      const quantity = item.quantity || 1;
      const price = parseFloat(product.price);
      total += price * quantity;

      await OrderItem.create(
        {
          order_id: order.id,
          product_id: product.id,
          quantity,
          price,
        },
        { transaction: t }
      );

      // optional: update stock
      if (product.stock != null) {
        product.stock = Math.max(0, product.stock - quantity);
        await product.save({ transaction: t });
      }
    }

    // Update total amount
    order.total_amount = total;
    await order.save({ transaction: t });

    await t.commit();

    const orderWithItems = await Order.findByPk(order.id, {
      include: [OrderItem, User],
    });

    res.status(201).json({ message: "Order created successfully", data: orderWithItems });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [OrderItem, User] });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: [OrderItem, User] });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Delete order
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await order.destroy();
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

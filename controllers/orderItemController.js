import OrderItem from "../models/orderItem.js";

export const getOrderItems = async (req, res) => {
  try {
    const items = await OrderItem.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrderItemById = async (req, res) => {
  try {
    const item = await OrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "OrderItem not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

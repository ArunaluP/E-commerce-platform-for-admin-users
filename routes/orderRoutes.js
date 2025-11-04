import express from "express";
import {
  createOrder, getOrders, getOrderById, deleteOrder
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/add", createOrder);
router.get("/all", getOrders);
router.get("/:id", getOrderById);
router.delete("/:id", deleteOrder);

export default router;

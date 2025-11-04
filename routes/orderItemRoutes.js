import express from "express";
import { getOrderItems, getOrderItemById } from "../controllers/orderItemController.js";

const router = express.Router();

router.get("/all", getOrderItems);
router.get("/:id", getOrderItemById);

export default router;

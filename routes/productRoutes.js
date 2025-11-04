import express from "express";
import {
  createProduct, getProducts, getProductById, updateProduct, deleteProduct
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/products/:id", verifyToken, getProductById);
router.post("/add", createProduct);
router.get("/all", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;

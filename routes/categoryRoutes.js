import express from "express";
import {
  createCategory, getCategories, getCategoryById, updateCategory, deleteCategory, getAllCategoriesWithProducts, getCategoryWithProducts
} from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/categories-with-products", verifyToken, getAllCategoriesWithProducts);
router.get("/categories/:id/products", verifyToken, getCategoryWithProducts);
router.post("/add", createCategory);
router.get("/all", getCategories);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;

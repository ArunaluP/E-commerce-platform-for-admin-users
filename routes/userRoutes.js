import express from "express";
import {
  createUser, getAllUsers, getUserById, updateUser, deleteUser, registerUser, loginUser ,getUserProfile 
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/userdetails", verifyToken, getUserProfile);
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/add", createUser);
router.get("/all", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

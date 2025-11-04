import express from "express";
import adminJs, { adminRouter } from "../admin/admin.config.js";

const router = express.Router();

// Mount AdminJS router on the /admin path specifically
router.use("/admin", adminRouter);

export default router;

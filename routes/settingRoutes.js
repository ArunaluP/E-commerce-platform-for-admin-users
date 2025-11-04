import express from "express";
import { createSetting, getSettings, getSettingByKey } from "../controllers/settingController.js";

const router = express.Router();

router.post("/save", createSetting);     // create or update
router.get("/all", getSettings);
router.get("/:key", getSettingByKey);

export default router;

import Setting from "../models/setting.js";

export const createSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: "key required" });
    const [setting, created] = await Setting.findOrCreate({ where: { key }, defaults: { value } });
    if (!created) {
      setting.value = value;
      await setting.save();
    }
    res.json({ message: "Setting saved", data: setting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findOne({ where: { key: req.params.key } });
    if (!setting) return res.status(404).json({ error: "Setting not found" });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

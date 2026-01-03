// import model
const Setting = require("../models/setting.model");

// local fallback
const settingJson = require("../setting");

// helper to safely log settings (no secrets)
function logSettings(setting) {
  console.log("🧾 Settings Snapshot:");
  console.log({
    id: setting._id?.toString(),
    isAppEnabled: setting.isAppEnabled,
    isAutoRefreshEnabled: setting.isAutoRefreshEnabled,
    loginBonus: setting.loginBonus,
    currency: setting.currency?.currencyCode,
    stripeEnabled: setting.stripeEnabled,
    razorpayEnabled: setting.razorpayEnabled,
    flutterwaveEnabled: setting.flutterwaveEnabled,
    adminCommissionRate: setting.adminCommissionRate,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt
  });
}

async function initializeSettings() {
  try {
    console.log("🔄 Fetching settings from DB...");

    const setting = await Setting.findOne().sort({ _id: -1 });

    if (setting) {
      global.settingJSON = setting;

      console.log("✅ Settings loaded from DB.");

      logSettings(setting);
    } else {
      console.warn("⚠️ No settings found in DB. Creating default settings...");

      const defaultSetting = new Setting({});
      await defaultSetting.save();

      global.settingJSON = defaultSetting;
      console.log("✅ Default settings created and loaded.");
      logSettings(defaultSetting);
    }
  } catch (error) {
    console.error("❌ Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings;
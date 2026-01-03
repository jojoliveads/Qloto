const admin = require("firebase-admin");

// If already initialized, return it to prevent multiple init errors
if (admin.apps.length > 0) {
  module.exports = admin;
  return;
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle escaped newlines in env var for private key
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
};

// Initialize if Env vars are present
if (serviceAccount.projectId && serviceAccount.privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("🔥 Firebase initialized via Environment Variables");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase via Env Vars:", error);
  }
}
// Fallback to global settings (DB/Local Cache)
else if (global.settingJSON && global.settingJSON.privateKey) {
  try {
    const pk = global.settingJSON.privateKey;
    admin.initializeApp({
      credential: admin.credential.cert(pk),
    });
    console.log("🔥 Firebase initialized via DB/Global Settings");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase via Settings:", error);
  }
} else {
  console.warn("⚠️ Firebase not initialized! Missing credentials in ENV or DB Settings.");
}

module.exports = admin;

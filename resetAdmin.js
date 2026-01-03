/**
 * Script to reset admin user in both MongoDB and Firebase
 * Run: node resetAdmin.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection from .env
const MONGODB_URI = process.env.MongoDb_Connection_String;

// New admin credentials - change these as needed
const NEW_ADMIN = {
    uid: "admin_" + Date.now(),
    email: "admin@gmail.com",
    password: "123456"
};

async function resetAdmin() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Load models
        const Setting = require("./models/setting.model");
        const Admin = require("./models/admin.model");
        const Cryptr = require("cryptr");
        const cryptr = new Cryptr("myTotallySecretKey");

        // Get settings for Firebase
        const settings = await Setting.findOne({});
        if (!settings || !settings.privateKey || Object.keys(settings.privateKey).length === 0) {
            console.error("❌ Firebase private key not found in settings");
            console.log("Please register admin through the setup page first to configure Firebase.");
            process.exit(1);
        }

        // Initialize Firebase Admin
        const admin = require("firebase-admin");
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(settings.privateKey),
            });
        }
        console.log("✅ Firebase Admin SDK initialized");

        // Step 1: Get existing admin and delete from Firebase
        const existingAdmin = await Admin.findOne({});
        if (existingAdmin) {
            console.log(`📧 Found existing admin: ${existingAdmin.email}`);

            // Try to delete from Firebase
            try {
                const firebaseUser = await admin.auth().getUserByEmail(existingAdmin.email);
                await admin.auth().deleteUser(firebaseUser.uid);
                console.log("✅ Deleted existing user from Firebase");
            } catch (e) {
                if (e.code === "auth/user-not-found") {
                    console.log("ℹ️ User not found in Firebase (already deleted or never created)");
                } else {
                    console.warn("⚠️ Could not delete Firebase user:", e.message);
                }
            }
        }

        // Step 2: Delete all admins from MongoDB
        await Admin.deleteMany({});
        console.log("✅ Cleared all admins from MongoDB");

        // Step 3: Create new admin in MongoDB
        const newAdmin = new Admin({
            uid: NEW_ADMIN.uid,
            email: NEW_ADMIN.email,
            password: cryptr.encrypt(NEW_ADMIN.password),
            purchaseCode: "RESET_ADMIN"
        });
        await newAdmin.save();
        console.log("✅ Created new admin in MongoDB");

        // Step 4: Create new admin in Firebase
        try {
            await admin.auth().createUser({
                uid: NEW_ADMIN.uid,
                email: NEW_ADMIN.email,
                password: NEW_ADMIN.password,
                emailVerified: true
            });
            console.log("✅ Created new admin in Firebase");
        } catch (e) {
            if (e.code === "auth/email-already-exists") {
                // User exists with different UID, update it
                const existingUser = await admin.auth().getUserByEmail(NEW_ADMIN.email);
                await admin.auth().updateUser(existingUser.uid, {
                    password: NEW_ADMIN.password
                });
                // Update MongoDB UID to match Firebase
                await Admin.updateOne({ email: NEW_ADMIN.email }, { uid: existingUser.uid });
                console.log("✅ Updated existing Firebase user password and synced UID");
            } else {
                throw e;
            }
        }

        console.log("\n🎉 Admin reset successfully!");
        console.log("═══════════════════════════════════════");
        console.log(`  Email:    ${NEW_ADMIN.email}`);
        console.log(`  Password: ${NEW_ADMIN.password}`);
        console.log("═══════════════════════════════════════");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

resetAdmin();

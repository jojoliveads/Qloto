/**
 * Script to sync admin user to Firebase
 * Run: node syncAdminToFirebase.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jojolive";

async function syncAdminToFirebase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Load settings for Firebase
        const Setting = require("./models/setting.model");
        const Admin = require("./models/admin.model");
        const Cryptr = require("cryptr");
        const cryptr = new Cryptr("myTotallySecretKey");

        // Get settings
        const settings = await Setting.findOne({});
        if (!settings || !settings.privateKey) {
            console.error("❌ Firebase private key not found in settings");
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

        // Get admin from MongoDB
        const adminUser = await Admin.findOne({});
        if (!adminUser) {
            console.error("❌ No admin found in MongoDB");
            process.exit(1);
        }

        const email = adminUser.email;
        const password = cryptr.decrypt(adminUser.password);
        const uid = adminUser.uid;

        console.log(`📧 Admin Email: ${email}`);
        console.log(`🔑 Admin Password: ${password}`);
        console.log(`🆔 Admin UID: ${uid}`);

        // Check if user exists in Firebase
        try {
            const existingUser = await admin.auth().getUserByEmail(email);
            console.log("✅ User already exists in Firebase with UID:", existingUser.uid);

            // Update password to match MongoDB
            await admin.auth().updateUser(existingUser.uid, {
                password: password
            });
            console.log("✅ Password updated in Firebase to match MongoDB");

        } catch (error) {
            if (error.code === "auth/user-not-found") {
                console.log("⚠️ User not found in Firebase, creating...");

                // Create user in Firebase
                const newUser = await admin.auth().createUser({
                    uid: uid,
                    email: email,
                    password: password,
                    emailVerified: true
                });
                console.log("✅ User created in Firebase with UID:", newUser.uid);

            } else {
                throw error;
            }
        }

        console.log("\n🎉 Admin user synced successfully!");
        console.log(`\nYou can now login with:\n  Email: ${email}\n  Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

syncAdminToFirebase();

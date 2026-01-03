const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const checkAndCreate = async () => {
    try {
        const keyPath = path.join(__dirname, "../admin/jojo-live-fbc27-firebase-adminsdk-2kaqk-995a811083.json");
        console.log("Reading key from:", keyPath);
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const email = "admin@gmail.com";
        const password = "123456";

        try {
            const user = await admin.auth().getUserByEmail(email);
            console.log("User exists:", user.uid);
            await admin.auth().updateUser(user.uid, { password });
            console.log("Password updated to:", password);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                const user = await admin.auth().createUser({
                    uid: "admin",
                    email,
                    password,
                    emailVerified: true
                });
                console.log("User created:", user.uid);
            } else {
                throw e;
            }
        }
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAndCreate();

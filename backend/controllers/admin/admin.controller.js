const Admin = require("../../models/admin.model");

//fs
const fs = require("fs");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//deletefile
const { deleteFile } = require("../../util/deletefile");

// ====================== Imports ======================
const axios = require("axios");
const { exec } = require("child_process");
const Login = require("../../models/login.model");
const Setting = require("../../models/setting.model");


// ====================== Register Admin ======================
exports.registerAdmin = async (req, res) => {
  try {
    const uid = req?.body?.uid?.trim();
    const email = req?.body?.email?.trim();
    const password = req?.body?.password?.trim();
    const purchaseCode = req?.body?.code?.trim();
    const privateKey = req?.body?.privateKey;

    // Step 1: Validate input fields
    if (!uid || !email || !password || !purchaseCode || !privateKey) {
      return res.status(200).json({
        status: false,
        message: "Oops! Invalid or missing details.",
      });
    }

    // Step 2: Fetch settings
    let settings = await Setting.findOne({});
    if (!settings) {
      // Create default if not exists
      settings = new Setting();
      await settings.save();
    }

    // Step 3: Handle Private Key Update FIRST (needed for Firebase)
    if (privateKey) {
      try {
        if (typeof privateKey === "string") {
          settings.privateKey = JSON.parse(privateKey.trim());
        } else {
          settings.privateKey = privateKey;
        }
        await settings.save();
        updateSettingFile(settings);
      } catch (e) {
        console.error("Error saving private key:", e);
      }
    }

    // Step 4: Overwrite existing admin in MongoDB
    await Admin.deleteMany({}); // Clear old admins to ensure clean slate

    // Step 5: Create new admin in MongoDB
    const newAdmin = new Admin({
      uid,
      email,
      password: cryptr.encrypt(password),
      purchaseCode,
    });

    await Promise.all([
      newAdmin.save(),
      Login.updateOne({}, { $set: { login: true } }, { upsert: true }),
    ]);

    // Step 6: Create Firebase User
    const firebaseAdmin = require("../../util/privateKey");
    try {
      const adminInstance = await firebaseAdmin;
      if (adminInstance) {
        try {
          await adminInstance.auth().getUserByEmail(email);
          console.log("Firebase user already exists");
          // Optionally update password here if needed
          const userRecord = await adminInstance.auth().getUserByEmail(email);
          await adminInstance.auth().updateUser(userRecord.uid, {
            password: password
          });
        } catch (e) {
          if (e.code === 'auth/user-not-found') {
            await adminInstance.auth().createUser({
              uid: uid,
              email: email,
              password: password,
              emailVerified: true
            });
            console.log("Firebase user created successfully");
          } else {
            throw e;
          }
        }
      } else {
        console.warn("Firebase Admin SDK not ready yet. User might need to retry login after restart.");
      }
    } catch (firebaseErr) {
      console.error("Firebase creation error:", firebaseErr);
      // Don't fail the whole request, but warn
    }

    // Step 7: Restart PM2 process (moved to end)
    if (privateKey) {
      exec("pm2 restart backend --update-env", (error, stdout, stderr) => {
        if (error) {
          console.error("PM2 restart error:", error.message);
          return;
        }
        if (stderr) console.error("PM2 stderr:", stderr);
        console.log("PM2 restarted successfully:", stdout);
      });
    }

    return res.status(200).json({
      status: true,
      message: "Admin created successfully! Please login.",
      admin: newAdmin,
    });
  } catch (err) {
    console.error("registerAdmin error:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};

// ====================== Validate Admin Login ======================
exports.validateAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json({
        status: false,
        message: "Oops! Invalid details!",
      });
    }

    const admin = await Admin.findOne({ email: email.trim() })
      .select("_id password purchaseCode")
      .lean();

    if (!admin) {
      return res.status(200).json({
        status: false,
        message: "Oops! Admin not found with that email.",
      });
    }

    if (cryptr.decrypt(admin.password) !== password) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Admin has successfully logged in.",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal Server Error",
    });
  }
};


//update admin profile
exports.modifyAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const admin = await Admin.findById(adminId).select("name email image password").lean();
    if (!admin) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Admin not found!" });
    }

    const updateFields = {
      name: req.body?.name || admin.name,
      email: req.body?.email ? req.body.email.trim() : admin.email,
    };

    if (req.file) {
      if (admin.image) {
        const imagePath = admin.image.includes("storage") ? "storage" + admin.image.split("storage")[1] : "";
        if (imagePath && fs.existsSync(imagePath)) {
          const imageName = imagePath.split("/").pop();
          if (!["male.png", "female.png"].includes(imageName)) {
            fs.unlinkSync(imagePath);
          }
        }
      }
      updateFields.image = req.file.path;
    }

    const [updatedAdmin] = await Promise.all([Admin.findByIdAndUpdate(req.admin._id, updateFields, { new: true, select: "name email image password" }).lean()]);

    updatedAdmin.password = cryptr.decrypt(updatedAdmin.password);

    return res.status(200).json({
      status: true,
      message: "Admin profile has been updated.",
      data: updatedAdmin,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get admin profile
exports.retrieveAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const [admin] = await Promise.all([Admin.findById(adminId).select("_id name email password image").lean()]);

    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin not found." });
    }

    admin.password = cryptr.decrypt(admin.password);

    return res.status(200).json({
      status: true,
      message: "Admin profile retrieved successfully!",
      data: admin,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password
exports.modifyPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "admin does not found." });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    if (cryptr.decrypt(admin.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops ! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    admin.password = hash;

    const [savedAdmin, data] = await Promise.all([admin.save(), Admin.findById(admin._id)]);

    data.password = cryptr.decrypt(savedAdmin.password);

    return res.status(200).json({
      status: true,
      message: "Password has been changed by the admin.",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//set Password
exports.performPasswordReset = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    admin.password = cryptr.encrypt(newPassword);
    await admin.save();

    admin.password = cryptr.decrypt(admin?.password);

    return res.status(200).json({
      status: true,
      message: "Password has been updated Successfully.",
      data: admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

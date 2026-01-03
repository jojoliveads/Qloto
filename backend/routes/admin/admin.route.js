const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../checkAccess");
const AdminController = require("../../controllers/admin/admin.controller");
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage: storage });
const validateAdminToken = require("../../middleware/verifyAdminAuthToken.middleware");

// Register admin
route.post("/registerAdmin", checkAccessWithSecretKey(), AdminController.registerAdmin);

// Validate admin login
route.post("/validateAdminLogin", checkAccessWithSecretKey(), AdminController.validateAdminLogin);

// Modify admin profile
route.patch("/modifyAdminProfile", checkAccessWithSecretKey(), validateAdminToken, upload.single("image"), AdminController.modifyAdminProfile);

// Retrieve admin profile
route.get("/retrieveAdminProfile", checkAccessWithSecretKey(), validateAdminToken, AdminController.retrieveAdminProfile);

// Modify password
route.patch("/modifyPassword", checkAccessWithSecretKey(), validateAdminToken, AdminController.modifyPassword);

// Perform password reset
route.patch("/performPasswordReset", checkAccessWithSecretKey(), validateAdminToken, AdminController.performPasswordReset);

module.exports = route;

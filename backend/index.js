//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

// Strict CORS for frontend domains
const corsOptions = {
  origin: [
    "http://localhost:5001",          // your local frontend
    "http://localhost:5002",          // agency local
    "http://localhost:3000",
    "https://jojolive.vercel.app",    // your deployed frontend
    "https://jojolive.in",
    "https://qloto.net",
    "https://agency.qloto.net",
    "https://admin.qloto.net",
    "https://agency.jojolive.in",
    "https://appadmin.jojolive.in",
    "https://admin.jojolive.in",
    "https://jojolive-admin.up.railway.app",
    "https://jojolive-backend.up.railway.app",
    "https://admin-brown-phi.vercel.app",    // new Vercel admin
    "https://agency-jojos-projects-017c4652.vercel.app"  // new Vercel agency
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "key", "x-admin-uid", "x-agency-uid"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // IMPORTANT for preflight
app.use(express.json());

//logging middleware
const logger = require("morgan");
app.use(logger("dev"));

//path
const path = require("path");

//fs
const fs = require("fs");

//dotenv
require("dotenv").config({ path: ".env" });

//socket io
const http = require("http");
const server = http.createServer(app);

// socket.io with CORS
global.io = require("socket.io")(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"]
  }
});

//connection.js
const db = require("./util/connection");

//Declare global variable
global.settingJSON = {};

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

//Step 1: Import initializeSettings
const initializeSettings = require("./util/initializeSettings");

async function startServer() {
  console.log("🔄 Initializing settings...");
  await initializeSettings();
  console.log("✅ Settings Loaded");

  //Step 2: Require all other modules after settings are initialized
  const routes = require("./routes/route");
  app.use("/api", routes);

  require("./socket");

  app.use("/storage", express.static(path.join(__dirname, "storage")));

  db.on("error", () => {
    console.log("Connection Error: ");
  });

  db.once("open", async () => {
    console.log("Mongo: successfully connected to db");
  });

  //Step 3: Start Server after all setup is done
  server.listen(process.env.PORT || 5000, () => {
    console.log("🚀 Server listening on " + process.env.PORT);
  });
}

//Run server startup
startServer();
//express
const express = require("express");
const app = express();

//cors
const cors = require("cors");

// Strict CORS for frontend domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`📡 [CORS DEBUG] Request from Origin: ${origin} | Method: ${req.method} | URL: ${req.url}`);
  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    // allow all origins
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "key", "x-admin-uid", "x-agency-uid", "origin", "accept"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// No need for separate app.options("*", cors(corsOptions)) if app.use(cors()) is used first
app.get("/api/version", (req, res) => {
  res.status(200).json({ version: "1.0.1", timestamp: new Date().toISOString() });
});

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
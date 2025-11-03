const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require('./db');
const { testConnection } = require('./db');
const path = require("path");

require("dotenv").config();

const app = express();

// Middlewares
app.use(bodyParser.json());
testConnection();
app.use(cors());

// Serve uploaded files and reports statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/downloads", express.static(path.join(__dirname, "reports")));

// Report routes
const reportRoutes = require("./routes/reports");
app.use("/api/reports", reportRoutes);

//user routes
const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);
// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

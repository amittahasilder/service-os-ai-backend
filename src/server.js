require("dotenv").config();

const dns = require("node:dns");

// Use reliable public DNS for MongoDB SRV lookup
dns.setServers([
  "8.8.8.8",
  "1.1.1.1",
]);

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log("=================================");
      console.log("🚀 SERVICEOS API SERVER");
      console.log("=================================");
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(
        `Environment: ${process.env.NODE_ENV || "development"}`
      );
      console.log("=================================");
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("=================================");
    console.log("🍃 MONGODB CONNECTED");
    console.log("=================================");
    console.log(`Host: ${connection.connection.host}`);
    console.log(`Database: ${connection.connection.name}`);
    console.log("=================================");
  } catch (error) {
    console.error("=================================");
    console.error("❌ MONGODB CONNECTION FAILED");
    console.error("=================================");
    console.error("Message:", error.message);
    console.error("=================================");

    process.exit(1);
  }
};

module.exports = connectDB;
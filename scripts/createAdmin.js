require("dotenv").config();

const connectToDatabase = require("../src/config/db");
const User = require("../src/models/User");
const mongoose = require("mongoose");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env");
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a secret of at least 32 characters");
  }

  await connectToDatabase();
  const existingUser = await User.findOne({ email: ADMIN_EMAIL.toLowerCase().trim() });
  if (existingUser) {
    throw new Error("An account with ADMIN_EMAIL already exists; no changes were made");
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin"
  });
  console.log("Admin account created");
}

createAdmin()
  .catch((error) => {
    console.error("Failed to create admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

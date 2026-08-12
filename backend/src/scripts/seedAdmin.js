import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = await User.findOneAndUpdate(
      { email: "admin@campusconnect.com" },
      {
        name: "Campus Admin",
        email: "admin@campusconnect.com",
        password: hashedPassword,
        role: "admin",
        status: "active",
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log("Admin account ready");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Password reset to: Admin@123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Admin seed failed:", error);
    process.exit(1);
  }
};

seedAdmin();
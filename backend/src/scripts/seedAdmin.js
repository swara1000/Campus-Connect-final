import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const email = "admin@campusconnect.com";
    const password = "Admin@123";

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    let admin = await User.findOne({
      email,
    }).select("+password");

    if (admin) {
      admin.name = "Campus Admin";
      admin.role = "admin";
      admin.password = hashedPassword;

      await admin.save();

      console.log(
        "Admin password reset successfully"
      );
    } else {
      admin = await User.create({
        name: "Campus Admin",
        email,
        password: hashedPassword,
        role: "admin",
        initials: "CA",
      });

      console.log(
        "Admin created successfully"
      );
    }

    console.log(
      "Email: admin@campusconnect.com"
    );

    console.log(
      "Password: Admin@123"
    );

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error(
      "Seed admin error:",
      error
    );

    process.exit(1);
  }
};

seedAdmin();
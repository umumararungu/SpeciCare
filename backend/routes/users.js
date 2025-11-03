// routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      insuranceNumber,
      dateOfBirth,
      gender,
      district,
      sector,
      cell,
      village,
      role = "patient",
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if phone number exists
    const existingPhone = await User.findOne({
      where: { phone },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone,
      password,
      insurance_number: insuranceNumber,
      date_of_birth: dateOfBirth,
      gender,
      district,
      sector,
      cell,
      village,
      role,
      is_active: true,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        insurance_number: user.insurance_number,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        district: user.district,
        sector: user.sector,
        cell: user.cell,
        village: user.village,        

      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user account",
      error: error.message,
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        insurance_number: user.insurance_number,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        district: user.district,
        sector: user.sector,
        cell: user.cell,
        village: user.village,        
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message,
    });
  }
});

// Logout user
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logout successful",
  });
});

// Get current user - FIXED VERSION
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated. Please login.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decode: ", decoded);

    // Find user
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      // Clear invalid token
      res.clearCookie("token");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    res.json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    // Clear invalid token
    res.clearCookie("token");

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
});

module.exports = router;

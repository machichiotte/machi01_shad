// src/controllers/authController.js
const bcrypt = require("bcrypt"); // For password hashing
const crypto = require("crypto"); // Use built-in crypto module
const authService = require("../services/authService");

// Import the specific loggers
const {errorLogger, infoLogger}  = require("../utils/loggerUtil.js");

async function generateSessionToken() {
  try {
    const randomBytes = crypto.randomBytes(32); // Simplified without callback
    const token = randomBytes.toString("base64url");
    infoLogger.info("Session token generated successfully.");
    return token;
  } catch (error) {
    errorLogger.error("Failed to generate session token", { error: error.message });
    throw new Error("Failed to generate session token");
  }
}

async function registerUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      infoLogger.info("Registration attempt with missing email or password.");
      return res
        .status(400)
        .json({ status: false, message: "Missing email or password" });
    }

    const status = await authService.createUserDBService(req.body);

    if (status) {
      infoLogger.info("User registered successfully", { email });
      console.log("🚀 ~ registerUser ~ email:", email)
      return res
        .status(201)
        .json({ status: true, message: "User created successfully" });
    }

    errorLogger.error("Error creating user", { email });
    return res
      .status(400)
      .json({ status: false, message: "Error creating user" });
  } catch (error) {
    errorLogger.error("Registration failed", { error: error.message, email: req.body.email });
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      infoLogger.info("Login attempt with missing email or password.");
      return res
        .status(400)
        .json({ status: false, message: "Missing email or password" });
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      infoLogger.info("Login attempt with invalid email", { email });
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = await generateSessionToken();
      infoLogger.info("User logged in successfully", { userId: user["_id"], email });
      return res.status(200).json({
        status: true,
        message: "Login successful",
        userId: user["_id"],
        token,
        expiresIn: Date.now() + 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      });
    }

    infoLogger.info("Login attempt with invalid password", { email });
    return res
      .status(401)
      .json({ status: false, message: "Invalid email or password" });
  } catch (error) {
    errorLogger.error("Login failed", { error: error.message, email: req.body.email });
    return res
      .status(500)
      .json({ status: false, message: "Login failed due to server error" });
  }
}

module.exports = { loginUser, registerUser };
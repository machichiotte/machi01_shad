// src/controllers/authController.js
const authService = require("../services/authService");

/**
 * Registers a new user.
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
async function registerUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Registration attempt with missing email or password.");
      return res
        .status(400)
        .json({ status: false, message: "Missing email or password" });
    }

    const status = await authService.createUserDBService(req.body);

    if (status) {
      console.log("User registered successfully", { email });
      return res
        .status(201)
        .json({ status: true, message: "User created successfully" });
    }

    console.error("Error creating user", { email });
    return res
      .status(400)
      .json({ status: false, message: "Error creating user" });
  } catch (error) {
    console.error("Registration failed", { error: error.message, email: req.body.email });
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

/**
 * Authenticates a user and generates a session token.
 * @param {Object} req - The HTTP request object
 * @param {Object} res - The HTTP response object
 */
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Login attempt with missing email or password.");
      return res
        .status(400)
        .json({ status: false, message: "Missing email or password" });
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      console.log("Login attempt with invalid email", { email });
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
    const passwordMatch = await authService.isPasswordMatch(password, user.password);

    if (passwordMatch) {
      const token = await authService.generateSessionToken();
      console.log("User logged in successfully", { userId: user["_id"], email });
      return res.status(200).json({
        status: true,
        message: "Login successful",
        userId: user["_id"],
        token,
        expiresIn: Date.now() + 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      });
    }

    console.log("Login attempt with invalid password", { email });
    return res
      .status(401)
      .json({ status: false, message: "Invalid email or password" });
  } catch (error) {
    console.error("Login failed", { error: error.message, email: req.body.email });
    return res
      .status(500)
      .json({ status: false, message: "Login failed due to server error" });
  }
}

module.exports = { loginUser, registerUser };
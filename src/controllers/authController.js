// src/controllers/authController.js
const bcrypt = require("bcrypt"); // For password hashing
const crypto = require("crypto"); // Use built-in crypto module

const authService = require("../services/authService");

async function generateSessionToken(user) {
  // 1. Generate a cryptographically secure random string
  const randomBytes = await new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });

  // 2. Convert random bytes to a base64-encoded string (URL-safe)
  const token = randomBytes.toString("base64url");

  // 3. (Optional) Store additional information (e.g., user ID, expiration time)
  // in a database or in-memory cache (securely) if needed.
  // This enhances security and allows for session management features.

  return token;
}

async function registerUser(req, res) {
  try {
    const status = await authService.createUserDBService(req.body);

    if (status) {
      res
        .status(200)
        .send({ status: true, message: "User created successfully" });
    } else {
      res.status(401).send({ status: false, message: "Error creating user" });
    }

    return res;
  } catch (error) {
    res.status(500).send({ status: false, message: "Error network" });
    console.error(error);
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);

    if (!user) {
      res
        .status(401)
        .send({ status: false, message: "Invalid email or password" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // Generate a secure, unique session token for the user
      const token = await generateSessionToken(user);
      const expiresIn = Date.now() + 2 * 60 * 60 * 1000;
      res.status(200).send({
        status: true,
        message: "Login successful",
        email,
        userId: user["_id"],
        token,
        expiresIn,
      });
    } else {
      res
        .status(401)
        .send({ status: false, message: "Invalid email or password" });
    }

    return res;
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: false, message: "Login failed" });
  }
}

module.exports = { loginUser, registerUser };

// src/services/authService.js
const bcrypt = require("bcrypt"); // For password hashing
const crypto = require("crypto"); // Use built-in crypto module
const mongodbService = require("./mongodbService.js");

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves to true if the passwords match, false otherwise.
 */
async function isPasswordMatch(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * Creates a new user in the database with hashed password.
 * @param {Object} userDetails - The user details to be saved.
 * @param {string} userDetails.password - The user's password to be hashed.
 * @returns {Promise<boolean>} - A promise that resolves to true if user creation was successful, false otherwise.
 */
async function createUserDBService(userDetails) {
  try {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10); // Adjust salt rounds as needed
    const newUser = { ...userDetails, password: hashedPassword }; // Spread operator

    const collection = process.env.MONGODB_COLLECTION_USERS;
    const result = await mongodbService.saveData(newUser, collection);

    console.log(
      "🚀 ~ createUserDBService ~ result.insertedId:",
      result.insertedId
    );
    return true;
  } catch (err) {
    console.log("🚀 ~ createUserDBService ~ err:", err);
    return false;
  }
}

/**
 * Finds a user in the database by their email address.
 * @param {string} email - The email address of the user to find.
 * @returns {Promise<Object|null>} - A promise that resolves to the user object if found, or null if not found or on error.
 */
async function findUserByEmail(email) {
  try {
    const collection = process.env.MONGODB_COLLECTION_USERS;
    console.log("🚀 ~ findUserByEmail ~ collection:", collection);
    const user = await mongodbService.getOne(collection, { email }); // Filter by email
    console.log("🚀 ~ findUserByEmail ~ user:", user);
    return user; // Return the found user object or null if not found
  } catch (err) {
    console.log("🚀 ~ findUserByEmail ~ err:", err);
    return null; // Indicate error or user not found
  }
}

/**
 * Generates a secure random session token.
 * @returns {Promise<string>} - A promise that resolves to the generated session token.
 * @throws {Error} - Throws an error if token generation fails.
 */
async function generateSessionToken() {
  try {
    const randomBytes = crypto.randomBytes(32); // Simplified without callback
    const token = randomBytes.toString("base64url");
    console.log("Session token generated successfully.");
    return token;
  } catch (error) {
    console.error("Failed to generate session token", { error: error.message });
    throw new Error("Failed to generate session token");
  }
}

module.exports = { isPasswordMatch, createUserDBService, findUserByEmail, generateSessionToken };

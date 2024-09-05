// src/services/authService.js
const bcrypt = require("bcrypt"); // For password hashing
const crypto = require("crypto"); // Use built-in crypto module

const { saveData, getOne } = require("./mongodbService");

async function isPasswordMatch(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

async function createUserDBService(userDetails) {
  try {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10); // Adjust salt rounds as needed
    const newUser = { ...userDetails, password: hashedPassword }; // Spread operator

    const collection = process.env.MONGODB_COLLECTION_USERS;
    const result = await saveData(newUser, collection);

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

async function findUserByEmail(email) {
  try {
    const collection = process.env.MONGODB_COLLECTION_USERS;
    console.log("🚀 ~ findUserByEmail ~ collection:", collection);
    const user = await getOne(collection, { email }); // Filter by email
    console.log("🚀 ~ findUserByEmail ~ user:", user);
    return user; // Return the found user object or null if not found
  } catch (err) {
    console.log("🚀 ~ findUserByEmail ~ err:", err);
    return null; // Indicate error or user not found
  }
}

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

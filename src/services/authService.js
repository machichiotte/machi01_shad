const bcrypt = require("bcrypt"); // For password hashing

const { saveData, getOne } = require("./mongodb");

async function createUserDBService(userDetails) {
  try {
    const hashedPassword = await bcrypt.hash(userDetails.password, 10); // Adjust salt rounds as needed
    const newUser = { ...userDetails, password: hashedPassword }; // Spread operator

    const collection = process.env.MONGODB_COLLECTION_USERS;
    const result = await saveData(newUser, collection);

    console.log("User created successfully:", result.insertedId);

    return true;
  } catch (err) {
    console.error("Error creating user:", err);
    return false;
  }
}

async function findUserByEmail(email) {
  try {
    const collection = process.env.MONGODB_COLLECTION_USERS;
    const user = await getOne(collection, { email }); // Filter by email
    console.log("User found :", user);

    return user; // Return the found user object or null if not found
  } catch (err) {
    console.error("Error finding user by email:", err);
    return null; // Indicate error or user not found
  }
}

module.exports = { createUserDBService, findUserByEmail };

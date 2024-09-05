// src/utils/dataUtil.js
const fs = require("fs").promises;
const { getMockDataPath } = require("./fileUtil");
const mongodbService = require("../services/mongodbService");

/**
 * Retrieves data from the specified collection.
 * @param {string} collection - The MongoDB collection name.
 * @returns {Promise<Object[]>} - The retrieved data.
 */
async function getData(collectionName) {
  try {
    const data = await getDataFromCollection(collectionName);
    return data;
  } catch (error) {
    console.log("🚀 ~ getData ~ error:", error);
    throw new Error("Failed to get data from collection");
  }
}

// Main function to get data from the collection
async function getDataFromCollection(collectionName) {
  try {
    if (process.env.OFFLINE_MODE === "true") {
      // Get the mock data file path for the given collection
      const mockDataPath = getMockDataPath(collectionName);

      // Read the mock data from the file
      const jsonData = await fs.readFile(mockDataPath, "utf8");

      // Return parsed JSON data
      return JSON.parse(jsonData);
    } else {
      // Fetch data from MongoDB
      const data = await mongodbService.getAllDataMDB(collectionName);
      // Return data, ensuring it's an array
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.log("🚀 ~ getDataFromCollection ~ error:", error);
    return [];
  }
}

module.exports = {
  getData,
};

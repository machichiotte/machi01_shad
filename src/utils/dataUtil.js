// src/utils/dataUtil.js
const fs = require("fs").promises;
const { getMockDataPath } = require("./fileUtil.js");
const { getAllDataMDB } = require("../services/mongodbService.js");

/**
 * Retrieves data from the specified collection.
 * @param {string} collection - The MongoDB collection name.
 * @returns {Promise<Object[]>} - The retrieved data.
 */
async function getData(collection) {
 // console.log("🚀 ~ getData ~ collection:", collection);
  try {
    const data = await getDataFromCollection(collection);
    return data;
  } catch (error) {
    console.log("🚀 ~ getData ~ error:", error);
    throw new Error("Failed to get data from collection");
  }
}

// Function to detect circular references and log details
function findCircularReferences(obj, seen = new Set()) {
  if (obj && typeof obj === 'object') {
    if (seen.has(obj)) {
      return true; // Found a circular reference
    }
    seen.add(obj);
    for (let key in obj) {
      if (findCircularReferences(obj[key], seen)) {
        console.log(`Circular reference found at key: ${key}`);
        return true;
      }
    }
    seen.delete(obj);
  }
  return false;
}

// Main function to get data from the collection
async function getDataFromCollection(collectionName) {
  try {
    if (process.env.OFFLINE_MODE === "true") {
      // Get the mock data file path for the given collection
      const mockDataPath = getMockDataPath(collectionName);
      console.log("🚀 ~ getDataFromCollection ~ mockDataPath:", mockDataPath);

      // Read the mock data from the file
      const jsonData = await fs.readFile(mockDataPath, "utf8");
      console.log("🚀 ~ getDataFromCollection ~ jsonData:", jsonData.length);

      // Return parsed JSON data
      return JSON.parse(jsonData);
    } else {
      // Fetch data from MongoDB
      console.log(`🚀 ~ file: dataUtil.js:56 ~ getDataFromCollection ~ ONLINE collectionName:`, collectionName)

      const data = await getAllDataMDB(collectionName);

      // Detect circular references
      if (findCircularReferences(data)) {
        console.error("Circular references detected in data.");
        return [];
      }

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
  getDataFromCollection,
};

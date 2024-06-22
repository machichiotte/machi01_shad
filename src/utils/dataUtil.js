// src/utils/dataUtil.js
const fs = require("fs").promises;
const { getMockDataPath } = require("./fileUtil.js");
const { getAllDataMDB } = require("../services/mongodbService.js");

async function getData(req, res, collection) {
  console.log("🚀 ~ getData ~ collection:", collection)
  try {
    const data = await getDataFromCollection(collection);
    if (res) res.json(data);
    else return data;
  } catch (error) {
    console.log("🚀 ~ getData ~ error:", error)
    if (res) res.status(500).send({ error: "Internal server error" });
  }
}

async function getDataFromCollection(collection) {
  console.log("🚀 ~ getDataFromCollection ~ collection:", collection)
  try {
    if (process.env.OFFLINE_MODE === "true") {
      // Récupérer le chemin du fichier mock en fonction de la collection
      const mockDataPath = getMockDataPath(collection);
      console.log("🚀 ~ getDataFromCollection ~ mockDataPath:", mockDataPath)

      // Lire les données depuis le fichier mock
      const jsonData = await fs.readFile(mockDataPath, "utf8");
      console.log("🚀 ~ getDataFromCollection ~ jsonData:", jsonData)
      
      return JSON.parse(jsonData);
    } else {
      // Récupérer les données depuis la base de données MongoDB
      const data = await getAllDataMDB(collection);
      if (!Array.isArray(data)) {
        throw new Error('Data retrieved from MongoDB is not an array');
      }
      return data;
    }
  } catch (error) {
    console.log("🚀 ~ getDataFromCollection ~ error:", error)
    throw error;
  }
}

module.exports = {
  getData,
  getDataFromCollection,
};

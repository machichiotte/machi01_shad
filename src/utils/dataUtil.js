// src/utils/dataUtil.js
const fs = require("fs").promises;
const { getMockDataPath } = require("./fileUtil.js");
const { getAllDataMDB } = require("../services/mongodbService.js");

async function getData(req, res, collection) {
  try {
    const data = await getDataFromCollection(collection);
    if (res) res.json(data);
    else return data;
  } catch (err) {
    console.error("getData", err);
    if (res) res.status(500).send({ error: "Internal server error" });
  }
}

async function getDataFromCollection(collection) {
  try {
    if (process.env.OFFLINE_MODE === "true") {
      // Récupérer le chemin du fichier mock en fonction de la collection
      const mockDataPath = getMockDataPath(collection);

      // Lire les données depuis le fichier mock
      const jsonData = await fs.readFile(mockDataPath, "utf8");
      return JSON.parse(jsonData);
    } else {
      // Récupérer les données depuis la base de données MongoDB
      const data = await getAllDataMDB(collection);
      if (!Array.isArray(data)) {
        throw new Error('Data retrieved from MongoDB is not an array');
      }
      return data;
    }
  } catch (err) {
    console.error("getDataFromCollection", err);
    throw err;
  }
}

module.exports = {
  getData,
  getDataFromCollection,
};

// src/utils/fileUtil.js
const path = require("path");

function getMockDataPath(collection) {
  // Ajoutez la logique pour retourner le nom spécifique du mock en fonction de la collection
  const collectionMockName = `${collection}.json`;
  return path.join(__dirname, "mockData", "mongodb", collectionMockName);
}

module.exports = {
  getMockDataPath,
};

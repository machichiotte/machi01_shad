// lastUpdateController.test.js
const { getLastUpdate, getUniqueLastUpdate, updateLastUpdateByType } = require('../src/controllers/lastUpdateController');
const { getDataMDB, saveLastUpdateToMongoDB } = require('../src/services/utils.js');

jest.mock('../src/services/utils.js');

describe('LastUpdate Controller Tests', () => {
  describe('getLastUpdate', () => {
    it('should call getData with correct parameters and return data', async () => {
      // Votre test ici...
    });

    it('should handle errors during data retrieval and return appropriate response', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getLastUpdate
  });

  describe('getUniqueLastUpdate', () => {
    it('should call getDataMDB with correct parameters and return data', async () => {
      // Votre test ici...
    });

    it('should handle errors during data retrieval and return appropriate response', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getUniqueLastUpdate
  });

  describe('updateLastUpdateByType', () => {
    it('should call saveLastUpdateToMongoDB with correct parameters and return response', async () => {
      // Votre test ici...
    });

    it('should handle errors during data update and return appropriate response', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour updateLastUpdateByType
  });

  // Ajoutez d'autres tests généraux si nécessaire
});

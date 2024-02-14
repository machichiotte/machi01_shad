// marketsController.test.js
const { getMarkets, updateMarkets } = require('../src/controllers/marketsController');
const { createExchangeInstance, getData, deleteAndSaveData, saveLastUpdateToMongoDB } = require('../src/services/utils.js');

jest.mock('../src/services/utils.js');

describe('Markets Controller Tests', () => {
  describe('getMarkets', () => {
    it('should call getData with correct parameters and return data', async () => {
      // Votre test ici...
    });

    it('should handle errors during data retrieval and return appropriate response', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getMarkets
  });

  describe('updateMarkets', () => {
    it('should call createExchangeInstance, loadMarkets, mapMarkets, deleteAndSaveData, and saveLastUpdateToMongoDB with correct parameters and return data', async () => {
      // Votre test ici...
    });

    it('should handle errors during the update process and return appropriate response', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour updateMarkets
  });

  // Ajoutez d'autres tests généraux si nécessaire
});

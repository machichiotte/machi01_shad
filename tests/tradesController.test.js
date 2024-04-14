// tradesController.test.js
const {
    getTrades,
    addTradesManually,
    updateTrades,
  } = require('../src/controllers/tradesController');
  const {
    createExchangeInstance,
    getData,
    saveData,
    deleteAndSaveData,
    saveLastUpdateToMongoDB,
  } = require('../src/services/utils.js');
  const { mapTrades } = require('../src/services/mapping.js');
  
  jest.mock('../src/services/utils.js');
  jest.mock('../src/services/mongodb.js');
  jest.mock('../src/services/mapping.js');
  
  describe('Trades Controller Tests', () => {
    describe('getTrades', () => {
      it('should call getData with correct parameters and return data', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during data retrieval and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour getTrades
    });
  
    describe('addTradesManually', () => {
      it('should call saveData with correct parameters and return data', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during data saving and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour addTradesManually
    });
  
    describe('updateTrades', () => {
      it('should call createExchangeInstance, fetchMyTrades, mapTrades, deleteAndSaveData, and saveLastUpdateToMongoDB with correct parameters and return data', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during the update process and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour updateTrades
    });
  
    // Ajoutez d'autres tests généraux si nécessaire
  });
  
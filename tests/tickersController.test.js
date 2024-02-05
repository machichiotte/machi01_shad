// tickersController.test.js
const {
    getAllTickers,
    getAllTickersByExchange,
    getAllTickersBySymbolFromExchange,
    updateAllTickers,
  } = require('../src/controllers/tickersController');
  const {
    createExchangeInstance,
    saveLastUpdateToMongoDB,
    getData,
    deleteAndSaveObject,
  } = require('../src/services/utils.js');
  
  jest.mock('../src/services/utils.js');
  
  describe('Tickers Controller Tests', () => {
    describe('getAllTickers', () => {
      it('should call getData with correct parameters and return data', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during data retrieval and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour getAllTickers
    });
  
    describe('getAllTickersByExchange', () => {
      it('should call getData with correct parameters and return filtered data for the specified exchange', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during data retrieval and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour getAllTickersByExchange
    });
  
    describe('getAllTickersBySymbolFromExchange', () => {
      it('should call getData with correct parameters and return filtered data for the specified exchange and symbol', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during data retrieval and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour getAllTickersBySymbolFromExchange
    });
  
    describe('updateAllTickers', () => {
      it('should call createExchangeInstance, fetchTickers, mapTickers, deleteAndSaveObject, and saveLastUpdateToMongoDB with correct parameters and return data', async () => {
        // Votre test ici...
      });
  
      it('should handle errors during the update process and return appropriate response', async () => {
        // Votre test ici...
      });
  
      // Ajoutez d'autres tests pertinents pour updateAllTickers
    });
  
    // Ajoutez d'autres tests généraux si nécessaire
  });
  
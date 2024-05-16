// utils.test.js
const {
  createExchangeInstance,
  createExchangeInstanceWithReq,
  updateTimestampInMongoDB,
  saveLastUpdateToMongoDB,
  getData,
  deleteAndSaveData,
  deleteAndSaveObject,
  cronMarkets,
  handleErrorResponse,
} = require('../src/services/utils.js');
const {
  saveData,
  deleteMultipleDataMDB,
  getAllDataMDB,
  updateDataMDB,
  deleteAllDataMDB,
} = require('../src/services/mongodbService.js');
const { mapMarkets } = require('../src/services/mapping.js');
const ccxt = require('ccxt');

jest.mock('../src/services/mongodbService.js');
jest.mock('../src/services/mapping.js');
jest.mock('ccxt');

describe('Utils Tests', () => {
  describe('createExchangeInstance', () => {
    it('should create an instance of ccxt with correct parameters', () => {
      // Votre test ici...
    });

    it('should handle errors during instance creation and throw appropriate error', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour createExchangeInstance
  });

  describe('createExchangeInstanceWithReq', () => {
    it('should create an exchange instance with correct parameters from the request', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour createExchangeInstanceWithReq
  });

  describe('updateTimestampInMongoDB', () => {
    it('should call updateDataMDB with correct parameters', async () => {
      // Votre test ici...
    });

    it('should handle errors during update and log appropriately', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour updateTimestampInMongoDB
  });

  describe('saveLastUpdateToMongoDB', () => {
    it('should call getAllDataMDB, updateTimestampInMongoDB, and saveData with correct parameters', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour saveLastUpdateToMongoDB
  });

  describe('getData', () => {
    it('should call getAllDataMDB with correct parameters when offline mode is false', async () => {
      // Votre test ici...
    });

    it('should read mock data file and return parsed JSON when offline mode is true', async () => {
      // Votre test ici...
    });

    it('should handle errors during data retrieval and send appropriate response', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getData
  });

  describe('deleteAndSaveData', () => {
    it('should call deleteMultipleDataMDB and saveData with correct parameters when mapData is not empty', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour deleteAndSaveData
  });

  describe('deleteAndSaveObject', () => {
    it('should call deleteAllDataMDB and saveData with correct parameters when mapData is not empty', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour deleteAndSaveObject
  });

  describe('cronMarkets', () => {
    it('should call createExchangeInstance, loadMarkets, mapMarkets, deleteAndSaveData, and saveLastUpdateToMongoDB with correct parameters', async () => {
      // Votre test ici...
    });

    it('should handle errors during the update process and log appropriately', async () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour cronMarkets
  });

  describe('handleErrorResponse', () => {
    it('should send appropriate response and log error when given an AuthenticationError', () => {
      // Votre test ici...
    });

    it('should send a generic server error response and log error for other types of errors', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour handleErrorResponse
  });

  // Ajoutez d'autres tests généraux si nécessaire
});

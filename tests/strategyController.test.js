// strategyController.test.js
const { getStrat, updateStrat } = require('../src/controllers/strategyController');
const { getData, saveLastUpdateToMongoDB } = require('../src/services/utils');
const { deleteAllDataMDB, saveArrayDataMDB } = require('../src/services/mongodb');

describe('Strategy Controller Tests', () => {
  describe('getStrat', () => {
    it('should call getData with correct collection for strategy', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getStrat
  });

  describe('updateStrat', () => {
    it('should call deleteAllDataMDB, saveArrayDataMDB, and saveLastUpdateToMongoDB with correct parameters', () => {
      // Votre test ici...
    });

    it('should handle errors appropriately', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour updateStrat
  });

  // Ajoutez d'autres tests généraux si nécessaire
});

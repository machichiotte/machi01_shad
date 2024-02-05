// pricesController.test.js
const { getPriceBtc, getPriceEth } = require('../src/controllers/pricesController');
const { getData } = require('../src/services/utils'); // Assurez-vous d'importer les fonctions nécessaires

describe('Prices Controller Tests', () => {
  describe('getPriceBtc', () => {
    it('should call getData with correct collection for BTC prices', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getPriceBtc
  });

  describe('getPriceEth', () => {
    it('should call getData with correct collection for ETH prices', () => {
      // Votre test ici...
    });

    // Ajoutez d'autres tests pertinents pour getPriceEth
  });

  // Ajoutez d'autres tests généraux si nécessaire
});
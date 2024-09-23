import config from '../../config/index';

describe('Configuration', () => {
    it('devrait charger la configuration mockée', () => {
        expect(config.collection.orders).toBe('test_orders');
        expect(config.collection.shad).toBe('test_shad');
        expect(config.database.user).toBe('testUser');
        expect(config.database.password).toBe('testPassword');
        expect(config.apiKeys.binance.apiKey).toBe('test_binance_key');
        expect(config.smtp.host).toBe('smtp.test.email');
        // Ajoutez d'autres vérifications selon vos besoins
    });
});
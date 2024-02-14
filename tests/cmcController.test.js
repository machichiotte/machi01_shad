// cmcController.test.js
const cmcController = require('../src/controllers/cmcController');

import { getData, saveLastUpdateToMongoDB } from '../src/services/utils.js';
import { deleteAllDataMDB, saveArrayDataMDB } from '../src/services/mongodb.js';

// Import mocking tools
jest.mock('../src/services/utils.js');
jest.mock('../src/services/mongodb.js');

global.fetch = jest.fn();

test('getCmc should call getData with correct collection and default file', async () => {
    // Mock getData to return a mock result
    getData.mockResolvedValueOnce({ data: 'mocked data' });

    const req = {};
    const res = {};

    await cmcController.getCmc(req, res);

    expect(getData).toHaveBeenCalledWith(req, res, process.env.MONGODB_COLLECTION_CMC, 'db_machi_shad.collection_cmc.json');
});

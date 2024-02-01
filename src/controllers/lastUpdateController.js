// src/controllers/lastUpdateController.js
const { getData, saveLastUpdateToMongoDB } = require('../services/utils.js');
const { getDataMDB } = require('../services/mongodb.js');

async function getUniqueLastUpdate(req, res) {
    try {
        const { exchangeId, type } = req.params;
        const collectionName = process.env.MONGODB_COLLECTION_LAST_UPDATE;

        const filter = { exchangeId, type };
        const lastUpdateData = await getDataMDB(collectionName, filter);

        if (lastUpdateData.length > 0) {
            res.json(lastUpdateData[0]); // Prenez le premier document trouvé (il ne devrait y en avoir qu'un)
        } else {
            res.json({ exchangeId, type, timestamp: null });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}
async function getLastUpdate(req, res) {
    const collection = process.env.MONGODB_COLLECTION_LAST_UPDATE;
    await getData(req, res, collection, 'db_machi_shad.last_update.json');
}

async function updateLastUpdateByType(req, res) {
    try {
        const { exchangeId, type } = req.params;
        saveLastUpdateToMongoDB(type, exchangeId);
        res.json({ exchangeId, type, timestamp: null });
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'Internal server error' });
    }
}

module.exports = { getLastUpdate, getUniqueLastUpdate, updateLastUpdateByType }
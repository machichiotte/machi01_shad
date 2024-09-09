// src/routes/lastUpdateRoutes.ts
import express from 'express';
import { getLastUpdate, getUniqueLastUpdate, updateLastUpdateByType } from '../controllers/lastUpdateController';

const router = express.Router();

router.get('/get', getLastUpdate);
router.get('/get/:type/:platform', getUniqueLastUpdate);
router.get('/update/:type', updateLastUpdateByType);

export default router;
// src/routes/shadRoutes.ts
import express from 'express';
import { getShad } from '../controllers/shadController';

const router = express.Router();

router.get('/get', getShad);

export default router;
// src/routes/cmcRoutes.ts
import express from 'express';
import { getCmc, updateCmc } from '../controllers/cmcController';

const router = express.Router();

router.get('/get', getCmc);
router.get('/update', updateCmc);

export default router;
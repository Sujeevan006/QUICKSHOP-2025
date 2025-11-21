// E:\Axivers\NearBuy Project\shop-backend\routes\authRoutes.js

import express from 'express';
import * as auth from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.put('/update-profile', verifyToken, auth.updateProfile);

export default router;

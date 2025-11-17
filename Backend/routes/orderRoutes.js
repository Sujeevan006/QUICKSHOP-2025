// E:\Axivers\NearBuy Project\shop-backend\routes\orderRoutes.js

import express from 'express';
import * as order from '../controllers/orderController.js';
import { verifyToken, requireShopOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// all routes require shop‑owner login
router.use(verifyToken, requireShopOwner);

router.get('/', order.getOrders);
router.put('/:id/status', order.updateOrderStatus);

export default router;

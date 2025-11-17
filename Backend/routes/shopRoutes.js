// E:\Axivers\NearBuy Project\shop-backend\routes\shopRoutes.js

import express from 'express';
import * as shop from '../controllers/shopController.js';

const router = express.Router();

router.get('/', shop.getAllShops);
router.get('/:id', shop.getShopById);

export default router;

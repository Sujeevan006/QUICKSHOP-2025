// E:\Axivers\NearBuy Project\shop-backend\routes\productRoutes.js

import express from 'express';
import * as product from '../controllers/productController.js';
import { verifyToken, requireShopOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require shop‑owner login
router.use(verifyToken, requireShopOwner);

router.post('/', product.addProduct);
router.get('/', product.getProducts);
router.get('/:id', product.getProductById);
router.put('/:id', product.updateProduct);
router.delete('/:id', product.deleteProduct);

export default router;

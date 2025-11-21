import express from 'express';
import * as category from '../controllers/categoryController.js';
import { verifyToken, requireShopOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require a shop owner role
router.use(verifyToken, requireShopOwner);

router.post('/', category.addCategory);
router.get('/', category.getCategories);
router.put('/:id', category.updateCategory); // NEW
router.delete('/:id', category.deleteCategory);

export default router;

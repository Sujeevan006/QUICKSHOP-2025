import express from 'express';
import * as offer from '../controllers/offerController.js';
import { verifyToken, requireShopOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require a shop owner role
router.use(verifyToken, requireShopOwner);

router.post('/', offer.addOffer);
router.get('/', offer.getOffers);
router.get('/:id', offer.getOfferById); // NEW
router.put('/:id', offer.updateOffer); // NEW
router.delete('/:id', offer.deleteOffer);

export default router;

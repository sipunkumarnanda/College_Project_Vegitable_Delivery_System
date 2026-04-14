import express from 'express';
import {
  placeOrder,
  getMyOrders,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All order routes must be protected

router.post('/', placeOrder);
router.get('/my', getMyOrders);

export default router;

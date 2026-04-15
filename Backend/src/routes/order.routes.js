import express from 'express';
import {
  placeOrder,
  getMyOrders,
} from '../controllers/order.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // All order routes must be protected

router.post('/', placeOrder);
router.get('/my', getMyOrders);

export default router;

import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  createRazorpayOrder,
  verifyPayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

export default router;

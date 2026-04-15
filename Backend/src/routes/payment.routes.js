import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  createRazorpayOrder,
  verifyPayment,
} from '../controllers/payment.controller.js';

const router = express.Router();

router.use(protect);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

export default router;

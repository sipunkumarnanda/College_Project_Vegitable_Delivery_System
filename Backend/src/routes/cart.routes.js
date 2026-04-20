import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity
} from '../controllers/cart.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect); // All cart routes must be protected

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.post("/update", updateCartQuantity);

export default router;

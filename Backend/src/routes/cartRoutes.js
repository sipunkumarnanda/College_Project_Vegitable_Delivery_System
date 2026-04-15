import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All cart routes must be protected

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);

export default router;

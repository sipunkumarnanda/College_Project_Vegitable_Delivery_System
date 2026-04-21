import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleStock
} from '../controllers/product.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { isVendor } from '../middlewares/role.middleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, isVendor, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, isVendor, updateProduct)
  .delete(protect, isVendor, deleteProduct);

// ✅ NEW
router.put('/:id/toggle-stock', protect, isVendor, toggleStock);

export default router;

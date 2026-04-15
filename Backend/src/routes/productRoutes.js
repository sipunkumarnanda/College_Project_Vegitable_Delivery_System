import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { isVendor } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, isVendor, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, isVendor, updateProduct)
  .delete(protect, isVendor, deleteProduct);

export default router;

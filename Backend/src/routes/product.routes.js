
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
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// ✅ GET + POST (with upload)
router.route('/')
  .get(getProducts)
  .post(protect, isVendor, upload.single("image"), createProduct);

// ✅ GET / PUT / DELETE
router.route('/:id')
  .get(getProductById)
  .put(protect, isVendor, updateProduct)
  .delete(protect, isVendor, deleteProduct);

// ✅ Toggle stock
router.put('/:id/toggle-stock', protect, isVendor, toggleStock);

export default router;
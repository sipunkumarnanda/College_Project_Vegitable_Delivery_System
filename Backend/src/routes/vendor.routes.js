import express from 'express';
import { getVendorProducts, getVendorOrders, updateOrderStatus, getVendorStats , getInvoice} from '../controllers/vendor.controller.js';

import { protect } from '../middlewares/auth.middleware.js';
import { vendorApproved } from '../middlewares/vendor.middleware.js';

const router = express.Router();

// All routes are protected and require the vendor to be approved
router.get('/products', protect, vendorApproved, ...getVendorProducts);
router.get('/orders', protect, vendorApproved, getVendorOrders);
router.put("/orders/:id/status", protect, vendorApproved, updateOrderStatus);
router.get("/stats", protect, vendorApproved, getVendorStats);
router.get("/orders/:id/invoice", protect, vendorApproved, getInvoice);

export default router;
import express from 'express';
import {
  getStats,
  getOrdersStats,
  getVendors,
  toggleVendorActive,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getAllOrders
} from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes are protected and admin only
router.get('/stats', protect, ...getStats);
router.get('/orders-stats', protect, ...getOrdersStats);
router.get('/vendors', protect, ...getVendors);
router.put('/vendors/:id/toggle', protect, ...toggleVendorActive);
router.get('/vendors/pending', protect, ...getPendingVendors);
router.put('/vendors/:id/approve', protect, ...approveVendor);
router.put('/vendors/:id/reject', protect, ...rejectVendor);
router.get('/orders', protect, ...getAllOrders);

export default router;

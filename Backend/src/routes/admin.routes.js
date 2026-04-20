
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
import { isAdmin } from '../middlewares/role.middleware.js';

const router = express.Router();

// Apply middleware globally to all routes in this router 
router.use(protect, isAdmin);

// Routes
router.get('/stats', getStats);
router.get('/orders-stats', getOrdersStats);
router.get('/vendors', getVendors);
router.put('/vendors/:id/toggle', toggleVendorActive);
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.get('/orders', getAllOrders);

export default router;
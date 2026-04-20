import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// 1️⃣ GET /api/admin/stats
export const getStats = async (req, res) => {
    try {
      const [totalProducts, totalOrders, totalVendors, orders] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: 'vendor' }),
        Order.find({}, 'totalPrice')
      ]);
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice?.amount || 0), 0);
      res.status(200).json({
        success: true,
        data: { totalProducts, totalOrders, totalVendors, totalRevenue }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 2️⃣ GET /api/admin/orders-stats
export const getOrdersStats = async (req, res) => {
    try {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      const formatted = stats.map(s => ({ date: s._id, orders: s.orders }));
      res.status(200).json({ success: true, data: formatted });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 3️⃣ GET /api/admin/vendors
export const getVendors = async (req, res) => {
    try {
      const vendors = await User.find({ role: 'vendor' }, 'name email isActive isApproved createdAt');
      res.status(200).json({ success: true, data: vendors });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 4️⃣ PUT /api/admin/vendors/:id/toggle
export const toggleVendorActive = async (req, res) => {
    try {
      const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
      vendor.isActive = !vendor.isActive;
      await vendor.save();
      res.status(200).json({ success: true, data: { _id: vendor._id, isActive: vendor.isActive } });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 5️⃣ GET /api/admin/vendors/pending
export const getPendingVendors = async (req, res) => {
    try {
      const pending = await User.find({ role: 'vendor', isApproved: false }, 'name email isActive isApproved createdAt');
      res.status(200).json({ success: true, data: pending });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 6️⃣ PUT /api/admin/vendors/:id/approve
export const approveVendor = async (req, res) => {
    try {
      const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
      vendor.isApproved = true;
      await vendor.save();
      res.status(200).json({ success: true, data: { _id: vendor._id, isApproved: vendor.isApproved } });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 7️⃣ PUT /api/admin/vendors/:id/reject
export const rejectVendor = async (req, res) => {
    try {
      const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' });
      if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
      vendor.isApproved = false;
      await vendor.save();
      res.status(200).json({ success: true, data: { _id: vendor._id, isApproved: vendor.isApproved } });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

// 8️⃣ GET /api/admin/orders
export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price vendor');
      res.status(200).json({ success: true, data: orders });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

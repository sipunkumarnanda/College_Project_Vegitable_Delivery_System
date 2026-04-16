
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';

// Middleware to check vendor role
const checkVendor = (req, res, next) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied. Vendors only.' });
  }
  next();
};

// GET /api/vendor/products
export const getVendorProducts = [
  checkVendor,
  async (req, res) => {
    try {
      const products = await Product.find({ vendor: req.user._id });
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
];

// GET /api/vendor/orders

export const getVendorOrders = async (req, res) => {
  try {
    // 🔐 Only vendor
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Get all orders with product populated
    const orders = await Order.find()
      .populate("items.product", "name price vendor")
      .sort("-createdAt");

    // 🔹 Filter orders for this vendor
    const vendorOrders = orders
      .map((order) => {
        // filter items belonging to this vendor
        const vendorItems = order.items.filter(
          (item) =>
            item.product &&
            item.product.vendor.toString() === req.user._id.toString()
        );

        // if no items → skip order
        if (vendorItems.length === 0) return null;

        return {
          _id: order._id,
          items: vendorItems,
          totalPrice: order.totalPrice,
          status: order.status,
          shippingAddress: order.shippingAddress, // ✅ ADD THIS
          createdAt: order.createdAt,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: vendorOrders,
    });

  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// PUT /api/orders/:id/status

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // 🔐 Only vendor
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Validate status
    const validStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 🔹 Find order
    const order = await Order.findById(orderId).populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔹 Check vendor owns at least one product in order
    const hasVendorProduct = order.items.some(
      (item) =>
        item.product &&
        item.product.vendor.toString() === req.user._id.toString()
    );

    if (!hasVendorProduct) {
      return res.status(403).json({ message: "Not your order" });
    }

    // 🔹 Update status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



// GET /api/vendor/stats

export const getVendorStats = async (req, res) => {
  try {
    // 🔐 Only vendor
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Get all orders with product populated
    const orders = await Order.find()
      .populate("items.product", "vendor price")
      .sort("-createdAt");

    let totalOrders = 0;
    let totalRevenue = 0;

    // 🔹 Loop through orders
    orders.forEach((order) => {
      let hasVendorItem = false;

      order.items.forEach((item) => {
        if (
          item.product &&
          item.product.vendor.toString() === req.user._id.toString()
        ) {
          hasVendorItem = true;

          // Add revenue (price * quantity)
          totalRevenue += item.price.amount * item.quantity;
        }
      });

      if (hasVendorItem) {
        totalOrders += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
      },
    });

  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


//  GET /api/vendor/orders/:id/invoice

export const getInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    // 🔐 Only vendor
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const order = await Order.findById(orderId)
      .populate("items.product", "name price vendor");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔹 Filter vendor items
    const vendorItems = order.items.filter(
      (item) =>
        item.product &&
        item.product.vendor.toString() === req.user._id.toString()
    );

    if (vendorItems.length === 0) {
      return res.status(403).json({ message: "No access to this order" });
    }

    // 🔹 Clean items
    const cleanItems = vendorItems.map((item) => ({
      name: item.product.name,
      price: item.price.amount,
      quantity: item.quantity,
      total: item.price.amount * item.quantity,
    }));

    const totalAmount = cleanItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // 🔹 Final invoice
    const invoice = {
      orderId: order._id,
      date: order.createdAt.toISOString().split("T")[0],
      items: cleanItems,
      totalAmount,
      shippingAddress: {
        street: order.shippingAddress.street,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zip: order.shippingAddress.zip,
        country: order.shippingAddress.country,
      },
      status: order.status,
    };

    res.status(200).json({
      success: true,
      data: invoice,
    });

  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
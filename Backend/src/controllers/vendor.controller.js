
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Review from '../models/review.model.js';
import PDFDocument from "pdfkit";

// Middleware to check vendor role
const checkVendor = (req, res, next) => {
  if (!req.user || req.user.role !== 'vendor') {
    return res.status(403).json({ success: false, message: 'Access denied. Vendors only.' });
  }
  next();
};

// GET /api/vendor/products
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/vendor/orders

export const getVendorOrders = async (req, res) => {
  try {
    // 🔐 Only vendor
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Get all orders + populate user + products
    const orders = await Order.find()
      .populate("user", "name email") // ✅ FIX (IMPORTANT)
      .populate("items.product", "name price vendor")
      .sort("-createdAt");

    // 🔹 Filter orders for this vendor
    const vendorOrders = orders
      .map((order) => {
        const vendorItems = order.items.filter(
          (item) =>
            item.product &&
            item.product.vendor.toString() === req.user._id.toString()
        );

        // skip if no items for this vendor
        if (vendorItems.length === 0) return null;

        return {
          _id: order._id,
          user: order.user, // ✅ now populated
          items: vendorItems,
          totalPrice: order.totalPrice,
          status: order.status,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        };
      })
      .filter(Boolean); // ✅ correct place

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
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const vendorId = req.user._id;

    // 🟢 1. Get total products
    const totalProducts = await Product.countDocuments({ vendor: vendorId });

    // 🟢 2. Get orders
    const orders = await Order.find()
      .populate("items.product", "vendor")
      .sort("-createdAt");

    let totalOrders = 0;
    let totalRevenue = 0;

    orders.forEach((order) => {
      let hasVendorItem = false;

      order.items.forEach((item) => {
        if (
          item.product &&
          item.product.vendor.toString() === vendorId.toString()
        ) {
          hasVendorItem = true;

          totalRevenue += item.price.amount * item.quantity;
        }
      });

      if (hasVendorItem) totalOrders += 1;
    });

    // 🟢 3. Get ratings (reviews of vendor products)
    const ratings = await Review.find()
      .populate("user", "name image")
      .populate({
        path: "product",
        select: "name category vendor",
      })
      .sort("-createdAt")
      .limit(5);

    // 🟡 Filter only this vendor's product reviews
    const vendorRatings = ratings.filter(
      (r) =>
        r.product &&
        r.product.vendor.toString() === vendorId.toString()
    );

    // 🟢 Format response for frontend
    const formattedRatings = vendorRatings.map((r) => ({
      user: {
        name: r.user?.name,
        image: r.user?.image,
      },
      product: {
        id: r.product?._id,
        name: r.product?.name,
        category: r.product?.category,
      },
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        ratings: formattedRatings,
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

    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("items.product", "name vendor");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔹 Filter only vendor items
    const vendorItems = order.items.filter(
      (item) =>
        item.product &&
        item.product.vendor.toString() === req.user._id.toString()
    );

    if (vendorItems.length === 0) {
      return res.status(403).json({ message: "No access to this order" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=invoice.pdf");

    doc.pipe(res);

    // 🟢 HEADER
    doc.fontSize(20).text("FreshKart Invoice", { align: "center" });
    doc.moveDown();

    // 🟢 ORDER INFO
    doc.fontSize(12);
    doc.text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.text(`Payment: COD`); // 🔁 change if you have real field
    doc.moveDown();

    // 🟢 CUSTOMER
    doc.text("Customer Details:");
    doc.text(`Name: ${order.user?.name || "N/A"}`);
    doc.text(`Email: ${order.user?.email || "N/A"}`);
    doc.text(`Phone: ${order.shippingAddress?.phone || "N/A"}`);
    doc.moveDown();

    // 🟢 ADDRESS
    doc.text("Shipping Address:");
    doc.text(`${order.shippingAddress.street}`);
    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`
    );
    doc.text(
      `${order.shippingAddress.zip}, ${order.shippingAddress.country}`
    );
    doc.moveDown();

    // 🟢 TABLE HEADER
    doc.fontSize(13).text("Items", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(11);

    let totalAmount = 0;

    vendorItems.forEach((item, index) => {
      const total = item.price.amount * item.quantity;
      totalAmount += total;

      doc.text(
        `${index + 1}. ${item.product.name}`
      );
      doc.text(`   Qty: ${item.quantity}`);
      doc.text(`   Price: ₹${item.price.amount}`);
      doc.text(`   Total: ₹${total}`);
      doc.moveDown();
    });

    // 🟢 TOTAL
    doc.moveDown();
    doc.fontSize(14).text(`Grand Total: ₹${totalAmount}`, {
      align: "right",
    });

    doc.moveDown();
    doc.fontSize(10).text("Thank you for selling with FreshKart!", {
      align: "center",
    });

    doc.end();

  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// @desc    Place order from cart
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    // 📦 Validate shipping address
    const { shippingAddress } = req.body;
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    // 🛒 Get user cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price stock vendor"
    );

    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 🔁 Validate & prepare items
    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart no longer exist.",
        });
      }

      if (!product.vendor) {
        return res.status(400).json({
          success: false,
          message: `Vendor missing for product ${product.name}`,
        });
      }

      if (item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity for a product in your cart.",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const price = product.price;
      totalAmount += price * item.quantity;

      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        productName: product.name,
        quantity: item.quantity,
        price: {
          amount: price,
          currency: "INR",
        },
      });
    }

    // 🔒 SAFE stock update
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.product,
          stock: { $gte: item.quantity },
        },
        {
          $inc: { stock: -item.quantity },
        }
      );

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Stock changed, please try again",
        });
      }
    }

    // 🧾 Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: {
        amount: totalAmount,
        currency: "INR",
      },
      shippingAddress,
    });

    // 🧹 Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });

  } catch (error) {
    console.error("Error placing order:", error);

    // ✅ Mongoose validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    // ✅ Duplicate key
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate data error",
      });
    }

    // ❌ fallback
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    if (
      !req.user ||
      !req.user.id ||
      !mongoose.Types.ObjectId.isValid(req.user.id)
    ) {
      return res.status(401).json({ message: "Invalid user" });
    }
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name image")
      .sort("-createdAt");
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

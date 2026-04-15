import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import mongoose from "mongoose";

// @desc    Place order from cart
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    // Validate user ID
    if (
      !req.user ||
      !req.user.id ||
      !mongoose.Types.ObjectId.isValid(req.user.id)
    ) {
      return res.status(401).json({ message: "Invalid user" });
    }

    // Require shipping address in body
    const { shippingAddress } = req.body;
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      return res
        .status(400)
        .json({
          message:
            "Shipping address is required (street, city, state, zip, country)",
        });
    }

    // Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
    );
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validate each cart item
    for (const item of cart.items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product._id)) {
        return res
          .status(400)
          .json({
            message: "One or more products in your cart no longer exist.",
          });
      }
      if (typeof item.quantity !== "number" || item.quantity < 1) {
        return res
          .status(400)
          .json({ message: "Invalid quantity for a product in your cart." });
      }
      if (item.product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
          });
      }
      const price = item.product.price;
      totalAmount += price * item.quantity;
      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: {
          amount: price,
          currency: "INR",
        },
      });
    }

    // Create Order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalPrice: {
        amount: totalAmount,
        currency: "INR",
      },
      shippingAddress,
    });

    // Reduce stock for products
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: -item.quantity },
        },
        { new: false },
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ message: "Server Error" });
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


import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../models/order.model.js";
import Payment from "../models/payment.model.js";

// 🔹 Check env
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys missing in .env");
}

// 🔹 Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ======================================================
// 💳 CREATE RAZORPAY ORDER (FINAL)
// ======================================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // 🔹 Validate
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Valid orderId required" });
    }

    // 🔹 Get order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔹 Auth check
    if (!req.user || !order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔹 Already paid
    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const amountInPaise = Math.round(order.totalPrice.amount * 100);

    if (!amountInPaise || amountInPaise < 1) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    // 🔥 PREVENT DUPLICATE
    if (order.razorpayOrderId) {
      console.log("Returning existing Razorpay order");

      return res.status(200).json({
        success: true,
        data: {
          razorpayOrderId: order.razorpayOrderId,
          keyId: process.env.RAZORPAY_KEY_ID,
          amount: amountInPaise,
        },
      });
    }

    // 🔹 Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${order._id}`,
    });

    // Save immediately
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    console.log("Created Razorpay order:", razorpayOrder.id);

    // 🔹 Create Payment record only once
    const existingPayment = await Payment.findOne({ orderId });

    if (!existingPayment) {
      await Payment.create({
        orderId: order._id,
        user: req.user._id,
        razorpayOrderId: razorpayOrder.id,
        status: "PENDING",
        price: {
          amount: order.totalPrice.amount,
          currency: order.totalPrice.currency,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
      },
    });

  } catch (error) {
    console.error("Create Razorpay order error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// ======================================================
// ✅ VERIFY PAYMENT
// ======================================================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // 🔹 Validate
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({
        message: "All payment fields are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid orderId" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!req.user || !order.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔹 Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const paymentDetails = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      verifiedAt: new Date(),
    };

    const paymentDoc = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      orderId: order._id,
    });

    if (!paymentDoc) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    // ❌ Invalid
    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = "failed";
      order.paymentDetails = paymentDetails;
      await order.save();

      paymentDoc.status = "FAILED";
      await paymentDoc.save();

      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    // ✅ Success
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.paymentDetails = paymentDetails;
    await order.save();

    paymentDoc.status = "COMPLETED";
    paymentDoc.paymentId = razorpay_payment_id;
    paymentDoc.signature = razorpay_signature;
    await paymentDoc.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: order._id,
        paymentStatus: order.paymentStatus,
        status: order.status,
      },
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
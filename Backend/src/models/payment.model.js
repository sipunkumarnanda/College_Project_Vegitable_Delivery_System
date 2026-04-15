import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String, required: true },
    signature: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    price: {
      amount: { type: Number, required: true },
      currency: {
        type: String,
        required: true,
        default: "INR",
        enum: ["INR", "USD"],
      },
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

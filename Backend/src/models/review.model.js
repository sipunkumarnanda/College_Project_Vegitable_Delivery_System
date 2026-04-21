
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// ⚡ Auto-update product stats
reviewSchema.post("save", async function () {
  const Review = mongoose.model("Review");
  const Product = mongoose.model("Product");

  const stats = await Review.aggregate([
    { $match: { product: this.product } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(this.product, {
    averageRating: stats[0]?.avgRating || 0,
    totalReviews: stats[0]?.count || 0,
  });
});

export default mongoose.model("Review", reviewSchema);

import Review from "../models/review.model.js";

// ➕ Add Review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;

    const newReview = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      review,
    });

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You already reviewed this product",
      });
    }

    res.status(500).json({ message: "Error adding review" });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name image")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};
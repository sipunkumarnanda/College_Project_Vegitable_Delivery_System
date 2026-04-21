
import express from "express";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { isUser } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", protect, isUser, addReview); // ✅ FIXED
router.get("/:productId", getProductReviews);

export default router;

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import productReducer from "./features/product/productSlice";
import addressReducer from "./features/address/addressSlice";
import ratingReducer from "./features/rating/ratingSlice";
import authReducer from "./features/auth/authSlice"; // ✅ ADD

export const store = configureStore({
  reducer: {
    product: productReducer,
    cart: cartReducer,
    address: addressReducer,
    rating: ratingReducer,
    auth: authReducer, // ✅ ADD
  },
});

'use client';

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCart } from "@/lib/features/cart/cartSlice";

export default function CartInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart()); // ✅ runs once globally
  }, [dispatch]);

  return null;
}
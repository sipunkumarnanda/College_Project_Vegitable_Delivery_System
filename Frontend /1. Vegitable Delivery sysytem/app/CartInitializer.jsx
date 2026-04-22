
"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "@/lib/features/cart/cartSlice";

export default function CartInitializer() {
const dispatch = useDispatch();

const { user, isAuthChecked } = useSelector((state) => state.auth);

useEffect(() => {
if (isAuthChecked && user) {
dispatch(fetchCart());
}
}, [dispatch, user, isAuthChecked]);

return null;
}

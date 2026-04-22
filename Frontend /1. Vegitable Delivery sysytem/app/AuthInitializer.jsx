
"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, logoutUser } from "@/lib/features/auth/authSlice";
import { setAddresses } from "@/lib/features/address/addressSlice";
import api from "@/lib/api";

export default function AuthInitializer() {
const dispatch = useDispatch();

useEffect(() => {
const loadUser = async () => {
try {
const res = await api.get("/auth/me");

    const user = res.data.data;

    dispatch(setUser(user));
    dispatch(setAddresses(user.addresses || []));

  } catch (err) {
    dispatch(logoutUser());
  }
};

loadUser();

}, [dispatch]);

return null;
}

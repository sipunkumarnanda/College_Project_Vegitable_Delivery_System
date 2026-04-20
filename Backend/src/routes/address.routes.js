
import express from "express";
import {
  addAddress,
  getAddresses,
  deleteAddress,
  setDefaultAddress,
  updateAddress
} from "../controllers/address.controller.js";

import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/", protect, addAddress);
router.get("/", protect, getAddresses);
router.delete("/:index", protect, deleteAddress);
router.put("/default/:index", protect, setDefaultAddress);
router.put("/:index", protect, updateAddress); // optional

export default router;
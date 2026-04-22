
import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },

  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },

  landmark: { type: String },

  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: false });


// 🔥 NEW: Vendor / Store Schema
const storeSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, unique: true },
  description: { type: String },

  contact: { type: String },
  address: { type: String },
  pincode: { type: String },

  location: {
    lat: Number,
    lng: Number
  },

  image: { type: String },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { _id: false });


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['user', 'vendor', 'admin'],
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    // ✅ addresses (already good)
    addresses: [addressSchema],

    // 🔥 ADD THIS
    store: storeSchema

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
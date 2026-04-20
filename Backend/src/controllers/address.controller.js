
import User from "../models/user.model.js";


// ✅ ADD ADDRESS
export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // first address → default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    // if new default → remove old default
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to add address" });
  }
};


// ✅ GET ALL ADDRESSES
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};


// ✅ DELETE ADDRESS
export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const index = req.params.index;

    if (!user.addresses[index]) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = user.addresses[index].isDefault;

    user.addresses.splice(index, 1);

    // if deleted default → set first as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to delete address" });
  }
};


// ✅ SET DEFAULT ADDRESS
export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const index = req.params.index;

    if (!user.addresses[index]) {
      return res.status(404).json({ message: "Address not found" });
    }

    // remove old default
    user.addresses.forEach(addr => addr.isDefault = false);

    // set new default
    user.addresses[index].isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to update default address" });
  }
};


// ✅ UPDATE ADDRESS (OPTIONAL)
export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const index = req.params.index;

    if (!user.addresses[index]) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses[index] = {
      ...user.addresses[index]._doc,
      ...req.body
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to update address" });
  }
};
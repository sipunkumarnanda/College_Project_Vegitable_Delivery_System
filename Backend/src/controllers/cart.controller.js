
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product", "name price image stock");

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [] },
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    // 🔹 Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // 🔹 Validate quantity
    if (qty <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    if (qty > 10) {
      return res.status(400).json({ message: "Maximum 10 items allowed" });
    }

    // 🔹 Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔹 Check stock
    if (product.stock < qty) {
      return res.status(400).json({
        message: `Only ${product.stock} items left in stock`,
      });
    }

    // 🔹 Find or create cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity: qty }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // 🔹 Update quantity
        const newQty = cart.items[itemIndex].quantity + qty;

        if (newQty > product.stock) {
          return res.status(400).json({
            message: `Cannot add more. Only ${product.stock} items in stock.`,
          });
        }

        cart.items[itemIndex].quantity = newQty;
      } else {
        // 🔹 Add new item
        cart.items.push({ product: productId, quantity: qty });
      }

      await cart.save();
    }

    // 🔹 Populate and return
    cart = await cart.populate("items.product", "name price image stock");

    res.status(200).json({
      success: true,
      data: cart,
    });

  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Remove product from cart
// @route   POST /api/cart/remove
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    // 🔹 Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // 🔹 Check if product exists in cart
    const exists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      return res.status(400).json({ message: "Product not in cart" });
    }

    // 🔹 Remove item
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate("items.product", "name price image stock");

    res.status(200).json({
      success: true,
      data: cart,
    });

  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



export const updateCartQuantity = async (req, res) => {
try {
const { productId, quantity } = req.body;
const qty = Number(quantity);
// 🔹 Validate productId
if (!mongoose.Types.ObjectId.isValid(productId)) {
  return res.status(400).json({ message: "Invalid product ID" });
}

// 🔹 Validate quantity
if (qty < 1) {
  return res.status(400).json({ message: "Quantity must be at least 1" });
}

// 🔹 Check product exists
const product = await Product.findById(productId);
if (!product) {
  return res.status(404).json({ message: "Product not found" });
}

// 🔹 Check stock
if (qty > product.stock) {
  return res.status(400).json({
    message: `Only ${product.stock} items available`,
  });
}

const cart = await Cart.findOne({ user: req.user.id });

if (!cart) {
  return res.status(404).json({ message: "Cart not found" });
}

const itemIndex = cart.items.findIndex(
  (item) => item.product.toString() === productId
);

if (itemIndex === -1) {
  return res.status(400).json({ message: "Item not in cart" });
}

// 🔥 Update quantity
cart.items[itemIndex].quantity = qty;

await cart.save();

await cart.populate("items.product", "name price image stock");

res.status(200).json({
  success: true,
  data: cart,
});

} catch (error) {
console.error("Error updating cart:", error);
res.status(500).json({ message: "Server Error" });
}
};

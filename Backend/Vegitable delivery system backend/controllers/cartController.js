import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get logged-in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price image stock');

    if (!cart) {
      // Return empty cart structure if not found
      return res.status(200).json({ success: true, data: { items: [] } });
    }

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (qty <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock
    if (product.stock < qty) {
      return res.status(400).json({ message: `Only ${product.stock} items left in stock` });
    }

    // Find user's cart
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Create new cart
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity: qty }],
      });
    } else {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

      if (itemIndex > -1) {
        // Increment quantity
        const newTotalQty = cart.items[itemIndex].quantity + qty;
        if (newTotalQty > product.stock) {
          return res.status(400).json({ message: `Cannot add more. Only ${product.stock} items in stock.` });
        }
        cart.items[itemIndex].quantity = newTotalQty;
      } else {
        // Add new item
        cart.items.push({ product: productId, quantity: qty });
      }
      await cart.save();
    }

    // Populate and return
    cart = await cart.populate('items.product', 'name price image stock');
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Remove product from cart
// @route   POST /api/cart/remove
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    await cart.populate('items.product', 'name price image stock');

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

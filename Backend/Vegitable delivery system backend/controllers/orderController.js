import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Place order from cart
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res) => {
  try {
    // 1. Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    // 2. Handle empty cart
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    let totalAmount = 0;
    const orderItems = [];

    // 3. Loop through items to calculate amounts and check stock
    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({ message: 'One or more products in your cart no longer exist.' });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      // Snapshot price and calc total
      const price = product.price;
      totalAmount += price * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
      });
    }

    // 4. Create Order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
    });

    // 5. Reduce stock for products
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 6. Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

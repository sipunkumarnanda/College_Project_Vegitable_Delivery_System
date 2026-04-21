import Product from '../models/product.model.js';
import mongoose from "mongoose";

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const query = {};
    if (category) {
      query.category = category;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(query).skip(skip).limit(limitNumber);
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      page: pageNumber,
      totalPages: Math.ceil(total / limitNumber),
      totalProducts: total,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    // 🔹 Check valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id)
      .populate("vendor", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Vendor only)

export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, image, stock } = req.body;

    // 🔹 Basic validation
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // 🔹 Normalize name (avoid "Tomato" vs "tomato")
    const formattedName = name.trim().toLowerCase();

    // 🔹 Check duplicate for same vendor
    const existing = await Product.findOne({
      name: formattedName,
      vendor: req.user.id,   // safer than _id from JWT
    });

    if (existing) {
      return res.status(400).json({ message: "Product already exists" });
    }

    // 🔹 Create product
    const product = await Product.create({
      name: formattedName,
      price,
      category,
      description,
      image,
      stock,
      vendor: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Vendor only)
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure user is the vendor for this product
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this product' });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Vendor only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure user is the vendor for this product
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Product removed',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// toggle stock status
export const toggleStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔐 vendor check
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ TOGGLE LOGIC
    product.stock = product.stock > 0 ? 0 : 10;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated",
      data: product,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
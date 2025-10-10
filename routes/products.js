const express = require('express');
const {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getProductsByCategory
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Public routes
// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', getCategories);

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', getProduct);

// Admin only routes
// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', auth, admin, validateProduct, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', auth, admin, validateProduct, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private/Admin
router.delete('/:id', auth, admin, deleteProduct);

module.exports = router;

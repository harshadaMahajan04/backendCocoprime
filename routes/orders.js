const express = require('express');
const {
    getUserOrders,
    getOrder,
    createOrderFromCart,
    buyNow,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateCheckout, validateBuyNow } = require('../middleware/validation');

const router = express.Router();

// User routes (require authentication)
// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, getOrder);

// @route   POST /api/orders/checkout
// @desc    Create order from cart
// @access  Private
router.post('/checkout', auth, validateCheckout, createOrderFromCart);

// @route   POST /api/orders/buy-now
// @desc    Buy single product directly
// @access  Private
router.post('/buy-now', auth, validateBuyNow, buyNow);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', auth, cancelOrder);

// Admin routes
// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/admin/all', auth, admin, getAllOrders);

// @route   PUT /api/orders/admin/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/admin/:id/status', auth, admin, updateOrderStatus);

module.exports = router;

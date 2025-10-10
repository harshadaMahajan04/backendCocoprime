const express = require('express');
const {
    createPaymentIntent,
    confirmPayment,
    handleWebhook,
    getPaymentStatus,
    refundPayment
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validatePaymentIntent, validatePaymentConfirm } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/payment/create-intent
// @desc    Create payment intent for order
// @access  Private
router.post('/create-intent', auth, validatePaymentIntent, createPaymentIntent);

// @route   POST /api/payment/confirm
// @desc    Confirm payment completion
// @access  Private
router.post('/confirm', auth, validatePaymentConfirm, confirmPayment);

// @route   POST /api/payment/webhook
// @desc    Handle Stripe webhook events
// @access  Public (but validated by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// @route   GET /api/payment/status/:orderId
// @desc    Get payment status for order
// @access  Private
router.get('/status/:orderId', auth, getPaymentStatus);

// @route   POST /api/payment/refund
// @desc    Process refund for order
// @access  Private/Admin
router.post('/refund', auth, admin, refundPayment);

module.exports = router;

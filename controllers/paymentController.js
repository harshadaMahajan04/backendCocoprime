// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const { validationResult } = require('express-validator');
// const Order = require('../models/Order');

// // @desc    Create payment intent
// // @route   POST /api/payment/create-intent
// // @access  Private
// const createPaymentIntent = async (req, res, next) => {
//     try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: errors.array()
//             });
//         }

//         const { orderId } = req.body;

//         // Get the order
//         const order = await Order.findOne({ 
//             _id: orderId, 
//             user: req.user.id 
//         });

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         // Check if order is already paid
//         if (order.paymentInfo.status === 'completed') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Order is already paid'
//             });
//         }

//         // Create payment intent with Stripe
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(order.totalAmount * 100), // Convert to cents
//             currency: 'inr',
//             metadata: {
//                 orderId: order._id.toString(),
//                 userId: req.user.id.toString()
//             },
//             automatic_payment_methods: {
//                 enabled: true,
//             },
//         });

//         // Update order with payment intent ID
//         order.paymentInfo.stripePaymentIntentId = paymentIntent.id;
//         await order.save();

//         res.json({
//             success: true,
//             data: {
//                 clientSecret: paymentIntent.client_secret,
//                 paymentIntentId: paymentIntent.id,
//                 amount: order.totalAmount
//             }
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Confirm payment
// // @route   POST /api/payment/confirm
// // @access  Private
// const confirmPayment = async (req, res, next) => {
//     try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: errors.array()
//             });
//         }

//         const { paymentIntentId } = req.body;

//         // Retrieve payment intent from Stripe
//         const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//         if (!paymentIntent) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Payment intent not found'
//             });
//         }

//         // Find the order
//         const order = await Order.findOne({
//             'paymentInfo.stripePaymentIntentId': paymentIntentId,
//             user: req.user.id
//         });

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         // Update order payment status based on payment intent status
//         if (paymentIntent.status === 'succeeded') {
//             order.paymentInfo.status = 'completed';
//             order.paymentInfo.transactionId = paymentIntent.id;
//             order.orderStatus = 'processing';
//         } else if (paymentIntent.status === 'payment_failed') {
//             order.paymentInfo.status = 'failed';
//         }

//         await order.save();

//         res.json({
//             success: true,
//             message: 'Payment status updated successfully',
//             data: {
//                 paymentStatus: paymentIntent.status,
//                 orderStatus: order.orderStatus,
//                 order
//             }
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Handle Stripe webhook
// // @route   POST /api/payment/webhook
// // @access  Public
// const handleWebhook = async (req, res, next) => {
//     const sig = req.headers['stripe-signature'];
//     const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
//     } catch (err) {
//         console.error(`Webhook signature verification failed:`, err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     switch (event.type) {
//         case 'payment_intent.succeeded':
//             const paymentIntent = event.data.object;
//             await handlePaymentSuccess(paymentIntent);
//             break;
        
//         case 'payment_intent.payment_failed':
//             const failedPayment = event.data.object;
//             await handlePaymentFailure(failedPayment);
//             break;
        
//         default:
//             console.log(`Unhandled event type ${event.type}`);
//     }

//     res.json({ received: true });
// };

// // Helper function to handle successful payment
// const handlePaymentSuccess = async (paymentIntent) => {
//     try {
//         const order = await Order.findOne({
//             'paymentInfo.stripePaymentIntentId': paymentIntent.id
//         });

//         if (order) {
//             order.paymentInfo.status = 'completed';
//             order.paymentInfo.transactionId = paymentIntent.id;
//             order.orderStatus = 'processing';
//             await order.save();
            
//             console.log(`Payment successful for order ${order.orderNumber}`);
//         }
//     } catch (error) {
//         console.error('Error handling payment success:', error);
//     }
// };

// // Helper function to handle failed payment
// const handlePaymentFailure = async (paymentIntent) => {
//     try {
//         const order = await Order.findOne({
//             'paymentInfo.stripePaymentIntentId': paymentIntent.id
//         });

//         if (order) {
//             order.paymentInfo.status = 'failed';
//             await order.save();
            
//             console.log(`Payment failed for order ${order.orderNumber}`);
//         }
//     } catch (error) {
//         console.error('Error handling payment failure:', error);
//     }
// };

// // @desc    Get payment status
// // @route   GET /api/payment/status/:orderId
// // @access  Private
// const getPaymentStatus = async (req, res, next) => {
//     try {
//         const { orderId } = req.params;

//         const order = await Order.findOne({ 
//             _id: orderId, 
//             user: req.user.id 
//         });

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         res.json({
//             success: true,
//             data: {
//                 orderId: order._id,
//                 orderNumber: order.orderNumber,
//                 paymentStatus: order.paymentInfo.status,
//                 orderStatus: order.orderStatus,
//                 totalAmount: order.totalAmount,
//                 paymentMethod: order.paymentInfo.method
//             }
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Refund payment
// // @route   POST /api/payment/refund
// // @access  Private/Admin
// const refundPayment = async (req, res, next) => {
//     try {
//         const { orderId, amount, reason } = req.body;

//         const order = await Order.findById(orderId);
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Order not found'
//             });
//         }

//         if (order.paymentInfo.status !== 'completed') {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Order payment is not completed'
//             });
//         }

//         // Create refund with Stripe
//         const refund = await stripe.refunds.create({
//             payment_intent: order.paymentInfo.stripePaymentIntentId,
//             amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
//             reason: 'requested_by_customer',
//             metadata: {
//                 orderId: order._id.toString(),
//                 reason: reason || 'Refund requested'
//             }
//         });

//         // Update order status
//         order.paymentInfo.status = 'refunded';
//         order.orderStatus = 'cancelled';
//         order.cancellationReason = reason || 'Refund processed';
//         order.cancelledAt = new Date();

//         await order.save();

//         res.json({
//             success: true,
//             message: 'Refund processed successfully',
//             data: {
//                 refundId: refund.id,
//                 amount: refund.amount / 100,
//                 status: refund.status
//             }
//         });

//     } catch (error) {
//         next(error);
//     }
// };

// module.exports = {
//     createPaymentIntent,
//     confirmPayment,
//     handleWebhook,
//     getPaymentStatus,
//     refundPayment
// };

const Razorpay = require('razorpay');
const { validationResult } = require('express-validator');
const Order = require('../models/Order');

// Initialize Razorpay
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
} else {
    console.warn("⚠️ Razorpay not initialized: keys not found");
}

// @desc    Create Razorpay order (payment intent)
// @route   POST /api/payment/create-intent
// @access  Private
const createPaymentIntent = async (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay not available in this environment"
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { orderId } = req.body;

        const order = await Order.findOne({ _id: orderId, user: req.user.id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.paymentInfo.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Order is already paid'
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(order.totalAmount * 100), // in paise
            currency: 'INR',
            receipt: order._id.toString(),
            payment_capture: 1
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save Razorpay order ID in your DB
        order.paymentInfo.razorpayOrderId = razorpayOrder.id;
        await order.save();

        res.json({
            success: true,
            data: {
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Confirm payment
// @route   POST /api/payment/confirm
// @access  Private
const confirmPayment = async (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay not available in this environment"
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

        const order = await Order.findOne({ 
            'paymentInfo.razorpayOrderId': razorpayOrderId,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify payment signature (optional but recommended)
        const crypto = require('crypto');
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpayOrderId + "|" + razorpayPaymentId)
            .digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        // Update order as paid
        order.paymentInfo.status = 'completed';
        order.paymentInfo.transactionId = razorpayPaymentId;
        order.orderStatus = 'processing';
        await order.save();

        res.json({
            success: true,
            message: 'Payment successful',
            data: { order }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get payment status
// @route   GET /api/payment/status/:orderId
// @access  Private
const getPaymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: req.user.id });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            data: {
                orderId: order._id,
                orderNumber: order.orderNumber,
                paymentStatus: order.paymentInfo.status,
                orderStatus: order.orderStatus,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentInfo.method || 'razorpay'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refund payment
// @route   POST /api/payment/refund
// @access  Private/Admin
const refundPayment = async (req, res, next) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay not available in this environment"
            });
        }

        const { orderId, amount, reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.paymentInfo.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Payment not completed' });
        }

        const refund = await razorpay.payments.refund(order.paymentInfo.transactionId, {
            amount: amount ? Math.round(amount * 100) : undefined,
            notes: { reason: reason || 'Refund requested', orderId: order._id.toString() }
        });

        order.paymentInfo.status = 'refunded';
        order.orderStatus = 'cancelled';
        order.cancellationReason = reason || 'Refund processed';
        order.cancelledAt = new Date();
        await order.save();

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: { refund }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPaymentIntent,
    confirmPayment,
    getPaymentStatus,
    refundPayment
};

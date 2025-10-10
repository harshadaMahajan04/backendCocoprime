const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'name imageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.user.id });

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        }).populate('items.product', 'name imageUrl');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: { order }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create order from cart
// @route   POST /api/orders/checkout
// @access  Private
const createOrderFromCart = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { shippingAddress, paymentMethod = 'cod', notes } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product')
            .session(session);

        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Validate cart items and stock availability
        const orderItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id).session(session);
            
            if (!product || !product.isActive) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product.name} is no longer available`
                });
            }

            if (product.stock < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} items available`
                });
            }

            const itemTotal = item.quantity * item.price;
            
            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: item.price,
                total: itemTotal
            });

            subtotal += itemTotal;

            // Update product stock
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // Calculate totals
        const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
        const tax = Math.round(subtotal * 0.18); // 18% GST
        const totalAmount = subtotal + shippingCost + tax;

        // Create order
        const order = new Order({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentInfo: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'pending'
            },
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes
        });

        await order.save({ session });

        // Clear cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();

        // Populate product details for response
        await order.populate('items.product', 'name imageUrl');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: { order }
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Create order for single product (Buy Now)
// @route   POST /api/orders/buy-now
// @access  Private
const buyNow = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { productId, quantity, shippingAddress, paymentMethod = 'cod', notes } = req.body;

        // Get product
        const product = await Product.findById(productId).session(session);
        if (!product || !product.isActive) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Product not found or unavailable'
            });
        }

        // Check stock
        if (product.stock < quantity) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: `Insufficient stock. Only ${product.stock} items available`
            });
        }

        const price = product.discountPrice || product.price;
        const itemTotal = quantity * price;
        const subtotal = itemTotal;
        const shippingCost = subtotal > 500 ? 0 : 50;
        const tax = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + shippingCost + tax;

        // Create order
        const order = new Order({
            user: req.user.id,
            items: [{
                product: product._id,
                name: product.name,
                quantity,
                price,
                total: itemTotal
            }],
            shippingAddress,
            paymentInfo: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'pending'
            },
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes
        });

        await order.save({ session });

        // Update product stock
        product.stock -= quantity;
        await product.save({ session });

        await session.commitTransaction();

        // Populate product details for response
        await order.populate('items.product', 'name imageUrl');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: { order }
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findOne({ 
            _id: req.params.id, 
            user: req.user.id 
        }).session(session);

        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Update order status
        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = req.body.reason || 'Cancelled by user';

        await order.save({ session });

        // Restore product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }

        await session.commitTransaction();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: { order }
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let filter = {};
        
        if (req.query.status) {
            filter.orderStatus = req.query.status;
        }
        
        if (req.query.paymentStatus) {
            filter['paymentInfo.status'] = req.query.paymentStatus;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .populate('items.product', 'name imageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/admin/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, trackingNumber } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = status;
        
        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }
        
        if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserOrders,
    getOrder,
    createOrderFromCart,
    buyNow,
    cancelOrder,
    getAllOrders,
    updateOrderStatus
};

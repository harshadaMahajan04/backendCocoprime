const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price discountPrice imageUrl stock isActive');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = new Cart({ user: req.user.id, items: [] });
            await cart.save();
        }

        // Filter out inactive products and update cart
        const activeItems = cart.items.filter(item => 
            item.product && item.product.isActive && item.product.stock > 0
        );

        if (activeItems.length !== cart.items.length) {
            cart.items = activeItems;
            await cart.save();
        }

        res.json({
            success: true,
            data: { cart }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { productId, quantity = 1 } = req.body;

        // Check if product exists and is active
        const product = await Product.findOne({ 
            _id: productId, 
            isActive: true 
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or unavailable'
            });
        }

        // Check if enough stock is available
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        const price = product.discountPrice || product.price;

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            // Check total quantity against stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity} items. Only ${product.stock - cart.items[existingItemIndex].quantity} more items available`
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = price; // Update price in case it changed
        } else {
            // Add new item to cart
            cart.items.push({
                product: productId,
                quantity,
                price
            });
        }

        await cart.save();
        
        // Populate product details for response
        await cart.populate('items.product', 'name price discountPrice imageUrl stock');

        res.json({
            success: true,
            message: 'Item added to cart successfully',
            data: { cart }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // If quantity is 0 or negative, remove item
        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            // Check if product still exists and has enough stock
            const product = await Product.findOne({ 
                _id: productId, 
                isActive: true 
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product no longer available'
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }

            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].price = product.discountPrice || product.price;
        }

        await cart.save();
        await cart.populate('items.product', 'name price discountPrice imageUrl stock');

        res.json({
            success: true,
            message: 'Cart updated successfully',
            data: { cart }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
const removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name price discountPrice imageUrl stock');

        res.json({
            success: true,
            message: 'Item removed from cart successfully',
            data: { cart }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: { cart }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};

const { validationResult } = require('express-validator');
const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        // const skip = (page - 1) * limit;

        // Build filter object
        let filter = { isActive: true };
        
        if (req.query.category) {
            filter.category = req.query.category;
        }
        
        if (req.query.subcategory) {
            filter.subcategory = req.query.subcategory;
        }
        
        if (req.query.brand) {
            filter.brand = new RegExp(req.query.brand, 'i');
        }
        
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Build sort object
        let sort = {};
        if (req.query.sortBy) {
            const sortField = req.query.sortBy;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
            sort[sortField] = sortOrder;
        } else {
            sort = { createdAt: -1 }; // Default sort by newest
        }

        // Execute query
        const products = await Product.find(filter)
            .populate('createdBy', 'name email')
            .sort(sort)
            

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: {
                products,
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

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findOne({ 
            _id: req.params.id, 
            isActive: true 
        })
    //   const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: { product }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
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

        const productData = {
            ...req.body,
            createdBy: req.user.id
        };

        const product = new Product(productData);
        await product.save();

        // Populate the createdBy field for response
        await product.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
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

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Update product fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                product[key] = req.body[key];
            }
        });

        await product.save();
        await product.populate('createdBy', 'name email');

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Soft delete - set isActive to false
        product.isActive = false;
        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        
        res.json({
            success: true,
            data: { categories }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
const getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find({ 
            category, 
            isActive: true 
        })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Product.countDocuments({ category, isActive: true });

        res.json({
            success: true,
            data: {
                products,
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

module.exports = {
    getAllProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    getProductsByCategory
};

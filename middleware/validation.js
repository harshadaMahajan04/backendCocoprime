const { body, param, query } = require('express-validator');

// User validation
const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Street address cannot exceed 100 characters'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('City cannot exceed 50 characters'),
    body('address.state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('State cannot exceed 50 characters'),
    body('address.postalCode')
        .optional()
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage('Please provide a valid postal code'),
    body('address.country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country cannot exceed 50 characters')
];

const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Product validation
const validateProduct = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Product name must be between 1 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description must be between 1 and 1000 characters'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('discountPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Discount price must be a positive number'),
    body('category')
        .isIn(['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Other'])
        .withMessage('Please select a valid category'),
    body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('Please provide a valid image URL')
];

// Cart validation
const validateCartAdd = [
    body('productId')
        .isMongoId()
        .withMessage('Please provide a valid product ID'),
    body('quantity')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10')
];

const validateCartUpdate = [
    body('productId')
        .isMongoId()
        .withMessage('Please provide a valid product ID'),
    body('quantity')
        .isInt({ min: 0, max: 10 })
        .withMessage('Quantity must be between 0 and 10')
];

// Order validation
const validateCheckout = [
    body('shippingAddress.name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('shippingAddress.street')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Street address must be between 5 and 100 characters'),
    body('shippingAddress.city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    body('shippingAddress.state')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2 and 50 characters'),
    body('shippingAddress.postalCode')
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage('Please provide a valid postal code'),
    body('shippingAddress.country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country cannot exceed 50 characters'),
    body('shippingAddress.phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('paymentMethod')
        .optional()
        .isIn(['stripe', 'cod'])
        .withMessage('Payment method must be either stripe or cod'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];

const validateBuyNow = [
    body('productId')
        .isMongoId()
        .withMessage('Please provide a valid product ID'),
    body('quantity')
        .isInt({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10'),
    ...validateCheckout
];

// Payment validation
const validatePaymentIntent = [
    body('orderId')
        .isMongoId()
        .withMessage('Please provide a valid order ID')
];

const validatePaymentConfirm = [
    body('paymentIntentId')
        .notEmpty()
        .withMessage('Payment intent ID is required')
];

module.exports = {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
    validateProduct,
    validateCartAdd,
    validateCartUpdate,
    validateCheckout,
    validateBuyNow,
    validatePaymentIntent,
    validatePaymentConfirm
};

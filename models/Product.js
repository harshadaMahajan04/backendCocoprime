const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    // discountPrice: {
    //     type: Number,
    //     min: [0, 'Discount price cannot be negative'],
    //     validate: {
    //         validator: function(value) {
    //             return !value || value < this.price;
    //         },
    //         message: 'Discount price must be less than original price'
    //     }
    // },
    // category: {
    //     type: String,
    //     required: [true, 'Product category is required'],
    //     enum: {
    //         values: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Other'],
    //         message: 'Please select a valid category'
    //     }
    // },
    // subcategory: {
    //     type: String,
    //     trim: true
    // },
    // brand: {
    //     type: String,
    //     trim: true
    // },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/300x300?text=No+Image'
    },
    images: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // createdBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
}, {
    timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for effective price (considering discount)
productSchema.virtual('effectivePrice').get(function() {
    return this.discountPrice || this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= 5) return 'Low Stock';
    return 'In Stock';
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

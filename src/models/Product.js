import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Skin Care',
      'Hair Care', 
      'Lip Care',
      'Eye Care',
      'Body Care',
      'Facial Care',
      'Teeth Care',
      'Health & Beauty',
      'Makeup',
      'Tools'
    ]
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 20,
    min: [0, 'Low stock threshold cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  features: [{
    type: String,
    trim: true
  }],
  ingredients: [{
    type: String,
    trim: true
  }],
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['g', 'ml', 'oz', 'lb'],
      default: 'g'
    }
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'in'],
      default: 'cm'
    }
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  origin: {
    type: String,
    trim: true,
    maxlength: [50, 'Origin cannot exceed 50 characters']
  },
  skinType: {
    type: [String],
    enum: ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'All Types']
  },
  skinConcern: {
    type: [String],
    enum: ['Acne', 'Aging', 'Dark Spots', 'Dryness', 'Oiliness', 'Sensitivity', 'Uneven Skin Tone', 'Wrinkles']
  },
  productCode: {
    type: String,
    required: [true, 'Product code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0
  },
  watchersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  bengaliDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Bengali description cannot exceed 1000 characters']
  },
  bengaliName: {
    type: String,
    trim: true,
    maxlength: [200, 'Bengali name cannot exceed 200 characters']
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  shippingInfo: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    isFragile: {
      type: Boolean,
      default: false
    },
    requiresSpecialHandling: {
      type: Boolean,
      default: false
    }
  },
  inventory: {
    trackInventory: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: 1
    },
    maxOrderQuantity: {
      type: Number,
      min: 1
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating discount percentage
ProductSchema.virtual('calculatedDiscountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discountPercentage || 0;
});

// Virtual for checking if product is on sale
ProductSchema.virtual('isOnSaleVirtual').get(function() {
  return (this.originalPrice && this.originalPrice > this.price) || this.isOnSale;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Indexes for better performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isBestSeller: 1, status: 1 });

// Pre-save middleware to calculate discount percentage
ProductSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    this.isOnSale = true;
  }
  next();
});

// Static method to find products by category
ProductSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Static method to find featured products
ProductSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, status: 'active' });
};

// Static method to find best sellers
ProductSchema.statics.findBestSellers = function() {
  return this.find({ isBestSeller: true, status: 'active' });
};

// Instance method to update stock
ProductSchema.methods.updateStock = function(quantity) {
  if (quantity < 0 && Math.abs(quantity) > this.stock) {
    throw new Error('Insufficient stock');
  }
  this.stock += quantity;
  return this.save();
};

// Instance method to check if product is available
ProductSchema.methods.isAvailable = function() {
  return this.status === 'active' && (this.stock > 0 || !this.inventory.trackInventory);
};

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

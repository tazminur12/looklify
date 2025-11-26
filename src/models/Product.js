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
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  // New pricing structure fields
  regularPrice: {
    type: Number,
    min: [0, 'Regular price cannot be negative']
  },
  costPrice: {
    type: Number,
    min: [0, 'Cost price cannot be negative']
  },
  salePrice: {
    type: Number,
    min: [0, 'Sale price cannot be negative']
  },
  taxPercentage: {
    type: Number,
    min: [0, 'Tax percentage cannot be negative'],
    max: [100, 'Tax percentage cannot exceed 100'],
    default: null
  },
  // Shipping charges based on location
  shippingCharges: {
    insideDhaka: {
      type: Number,
      min: [0, 'Inside Dhaka shipping cannot be negative'],
      default: 0
    },
    outsideDhaka: {
      type: Number,
      min: [0, 'Outside Dhaka shipping cannot be negative'],
      default: 0
    }
  },
  discountStartDate: {
    type: Date
  },
  discountEndDate: {
    type: Date
  },
  // Legacy pricing fields (keeping for backward compatibility)
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  offerPrice: {
    type: Number,
    min: [0, 'Offer price cannot be negative']
  },
  offerPercentage: {
    type: Number,
    min: [0, 'Offer percentage cannot be negative'],
    max: [100, 'Offer percentage cannot exceed 100']
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
  features: {
    type: String,
    trim: true,
    default: ''
  },
  ingredients: {
    type: String,
    trim: true,
    default: ''
  },
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
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
  isOfferProduct: {
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
ProductSchema.index({ brand: 1, category: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ subcategory: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ offerPrice: 1 });
ProductSchema.index({ rating: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isFeatured: 1, status: 1 });
ProductSchema.index({ isBestSeller: 1, status: 1 });

// Pre-save middleware to calculate discount percentage
ProductSchema.pre('save', function(next) {
  // Handle new pricing structure
  if (this.regularPrice && this.salePrice && this.salePrice < this.regularPrice) {
    this.discountPercentage = Math.round(((this.regularPrice - this.salePrice) / this.regularPrice) * 100);
    this.isOnSale = true;
    // Set price to sale price for display (backward compatibility)
    if (!this.price) {
      this.price = this.salePrice;
    }
  } else if (this.regularPrice && !this.salePrice) {
    // If only regular price is set, use it as the main price for backward compatibility
    if (!this.price) {
      this.price = this.regularPrice;
    }
    // Don't overwrite if price is explicitly set
  } else if (!this.price && this.salePrice) {
    // If only salePrice is set, use it as price for backward compatibility
    this.price = this.salePrice;
  }
  
  // Legacy pricing calculations (keeping for backward compatibility)
  // Calculate discount from original price
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
    this.isOnSale = true;
  }
  
  // Calculate discount from offer price
  if (this.offerPrice && this.offerPrice < this.price) {
    this.discountPercentage = Math.round(((this.price - this.offerPrice) / this.price) * 100);
    this.isOnSale = true;
  }
  
  // Use offer percentage if provided
  if (this.offerPercentage && this.offerPercentage > 0) {
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

import mongoose from 'mongoose';

const PromoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    minlength: [3, 'Promo code must be at least 3 characters'],
    maxlength: [20, 'Promo code cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Promo code name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping'],
    required: [true, 'Promo code type is required'],
    default: 'percentage'
  },
  value: {
    type: Number,
    required: [true, 'Promo code value is required'],
    min: [0, 'Value cannot be negative']
  },
  // For percentage discounts, max value is 100
  // For fixed amount, it's the discount amount
  // For free shipping, value is 0
  minimumOrderAmount: {
    type: Number,
    min: [0, 'Minimum order amount cannot be negative'],
    default: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount cannot be negative']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1'],
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  usageLimitPerUser: {
    type: Number,
    min: [1, 'Usage limit per user must be at least 1'],
    default: 1
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'exhausted'],
    default: 'active'
  },
  applicableProducts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
    default: [] // Empty array means applicable to all products
  },
  applicableCategories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
    default: [] // Empty array means applicable to all categories
  },
  applicableBrands: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Brand',
    default: [] // Empty array means applicable to all brands
  },
  excludedProducts: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Product',
    default: []
  },
  excludedCategories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
    default: []
  },
  excludedBrands: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Brand',
    default: []
  },
  // User restrictions
  applicableUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [] // Empty array means applicable to all users
  },
  excludedUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  // New user only
  newUsersOnly: {
    type: Boolean,
    default: false
  },
  // First time purchase only
  firstTimePurchaseOnly: {
    type: Boolean,
    default: false
  },
  // Stackable with other promo codes
  stackable: {
    type: Boolean,
    default: false
  },
  // Priority (higher number = higher priority)
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  },
  // Auto-apply conditions
  autoApply: {
    type: Boolean,
    default: false
  },
  autoApplyConditions: {
    minimumOrderAmount: Number,
    minimumQuantity: Number,
    specificProducts: [mongoose.Schema.Types.ObjectId],
    specificCategories: [mongoose.Schema.Types.ObjectId]
  },
  // Analytics
  analytics: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalDiscountGiven: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    }
  },
  // SEO and marketing
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
  // Bengali translations
  bengaliName: {
    type: String,
    trim: true,
    maxlength: [100, 'Bengali name cannot exceed 100 characters']
  },
  bengaliDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Bengali description cannot exceed 500 characters']
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

// Virtual for checking if promo code is valid
PromoCodeSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Virtual for checking if promo code is expired
PromoCodeSchema.virtual('isExpired').get(function() {
  return this.validUntil < new Date();
});

// Virtual for checking if promo code is exhausted
PromoCodeSchema.virtual('isExhausted').get(function() {
  return this.usageLimit !== null && this.usedCount >= this.usageLimit;
});

// Virtual for remaining usage
PromoCodeSchema.virtual('remainingUsage').get(function() {
  if (this.usageLimit === null) return 'Unlimited';
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for discount display
PromoCodeSchema.virtual('discountDisplay').get(function() {
  switch (this.type) {
    case 'percentage':
      return `${this.value}% OFF`;
    case 'fixed_amount':
      return `BDT ${this.value} OFF`;
    case 'free_shipping':
      return 'FREE SHIPPING';
    default:
      return 'DISCOUNT';
  }
});

// Indexes for better performance
PromoCodeSchema.index({ status: 1, validFrom: 1, validUntil: 1 });
PromoCodeSchema.index({ type: 1, status: 1 });
PromoCodeSchema.index({ createdAt: -1 });
PromoCodeSchema.index({ priority: -1 });

// Pre-save middleware to validate dates and values
PromoCodeSchema.pre('save', function(next) {
  // Validate date range
  if (this.validFrom >= this.validUntil) {
    return next(new Error('Valid from date must be before valid until date'));
  }
  
  // Validate percentage value
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Percentage discount cannot exceed 100%'));
  }
  
  // Update status based on dates and usage
  const now = new Date();
  if (this.validUntil < now) {
    this.status = 'expired';
  } else if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    this.status = 'exhausted';
  }
  
  next();
});

// Static method to find active promo codes
PromoCodeSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  });
};

// Static method to find applicable promo codes for an order
PromoCodeSchema.statics.findApplicable = function(orderData) {
  const now = new Date();
  return this.find({
    status: 'active',
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: null },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
    ]
  }).sort({ priority: -1 });
};

// Instance method to check if promo code is applicable to a product
PromoCodeSchema.methods.isApplicableToProduct = function(productId) {
  // If no specific products are defined, it's applicable to all
  if (this.applicableProducts.length === 0) {
    return !this.excludedProducts.includes(productId);
  }
  
  return this.applicableProducts.includes(productId) && 
         !this.excludedProducts.includes(productId);
};

// Instance method to check if promo code is applicable to a category
PromoCodeSchema.methods.isApplicableToCategory = function(categoryId) {
  // If no specific categories are defined, it's applicable to all
  if (this.applicableCategories.length === 0) {
    return !this.excludedCategories.includes(categoryId);
  }
  
  return this.applicableCategories.includes(categoryId) && 
         !this.excludedCategories.includes(categoryId);
};

// Instance method to check if promo code is applicable to a brand
PromoCodeSchema.methods.isApplicableToBrand = function(brandId) {
  // If no specific brands are defined, it's applicable to all
  if (this.applicableBrands.length === 0) {
    return !this.excludedBrands.includes(brandId);
  }
  
  return this.applicableBrands.includes(brandId) && 
         !this.excludedBrands.includes(brandId);
};

// Instance method to check if promo code is applicable to a user
PromoCodeSchema.methods.isApplicableToUser = function(userId) {
  // If no specific users are defined, it's applicable to all
  if (this.applicableUsers.length === 0) {
    return !this.excludedUsers.includes(userId);
  }
  
  return this.applicableUsers.includes(userId) && 
         !this.excludedUsers.includes(userId);
};

// Instance method to calculate discount amount
PromoCodeSchema.methods.calculateDiscount = function(orderAmount, productIds = [], categoryIds = [], brandIds = []) {
  // Check if promo code is valid
  if (!this.isValid) {
    return { valid: false, discountAmount: 0, message: 'Promo code is not valid' };
  }
  
  // Check minimum order amount
  if (orderAmount < this.minimumOrderAmount) {
    return { 
      valid: false, 
      discountAmount: 0, 
      message: `Minimum order amount of BDT ${this.minimumOrderAmount} required` 
    };
  }
  
  let discountAmount = 0;
  
  switch (this.type) {
    case 'percentage':
      discountAmount = (orderAmount * this.value) / 100;
      break;
    case 'fixed_amount':
      discountAmount = this.value;
      break;
    case 'free_shipping':
      discountAmount = 0; // This would be handled separately for shipping
      break;
  }
  
  // Apply maximum discount limit
  if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
    discountAmount = this.maximumDiscountAmount;
  }
  
  // Ensure discount doesn't exceed order amount
  discountAmount = Math.min(discountAmount, orderAmount);
  
  return {
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    message: 'Promo code applied successfully'
  };
};

// Instance method to increment usage
PromoCodeSchema.methods.incrementUsage = function() {
  this.usedCount += 1;
  
  // Update status if exhausted
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    this.status = 'exhausted';
  }
  
  return this.save();
};

export default mongoose.models.PromoCode || mongoose.model('PromoCode', PromoCodeSchema);

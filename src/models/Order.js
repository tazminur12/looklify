import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: {
      type: String,
      default: ''
    },
    sku: {
      type: String,
      default: ''
    }
  }],
  shipping: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    deliveryNotes: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      enum: ['insideDhaka', 'outsideDhaka'],
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cod', 'online', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    provider: {
      type: String,
      enum: ['bikash', 'nogod', 'rocket', 'bkash'],
      default: null
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true
    },
    transactionId: {
      type: String,
      default: null,
      trim: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    bkashData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    paymentID: {
      type: String,
      default: null,
      trim: true
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  promoCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromoCode',
    default: null
  },
  promoCodeString: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true
  },
  trackingNumber: {
    type: String,
    default: null
  },
  shippedAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique Order ID before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    // Format: ORD-YYYYMMDD-XXXXX (e.g., ORD-20250112-ABC12)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    let uniqueOrderId = `ORD-${dateStr}-${randomStr}${randomNum}`;
    
    // Ensure uniqueness
    let counter = 0;
    while (await mongoose.model('Order').findOne({ orderId: uniqueOrderId })) {
      const newRandomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newRandomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      uniqueOrderId = `ORD-${dateStr}-${newRandomStr}${newRandomNum}`;
      counter++;
      if (counter > 10) {
        // Fallback to timestamp-based ID
        uniqueOrderId = `ORD-${dateStr}-${Date.now().toString().slice(-6)}`;
        break;
      }
    }
    
    this.orderId = uniqueOrderId;
  }
  next();
});

// Indexes for better performance
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });
OrderSchema.index({ createdAt: -1 });

// Virtual for formatted order date
OrderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for order status badge color
OrderSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    returned: 'gray'
  };
  return colors[this.status] || 'gray';
});

// Static method to get orders by user
OrderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to get orders by status
OrderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Instance method to update order status
OrderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  if (notes) {
    this.notes = notes;
  }
  
  const now = new Date();
  if (newStatus === 'shipped' && !this.shippedAt) {
    this.shippedAt = now;
  } else if (newStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = now;
  } else if (newStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = now;
  }
  
  return this.save();
};

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);


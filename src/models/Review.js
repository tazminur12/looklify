import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isApproved: {
    type: Boolean,
    default: false // Admin approval for reviews
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ReviewSchema.index({ product: 1, status: 1 });
ReviewSchema.index({ user: 1, product: 1 }); // Prevent duplicate reviews
ReviewSchema.index({ createdAt: -1 });

// Prevent duplicate reviews from same user on same product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);


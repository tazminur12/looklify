import mongoose from 'mongoose';

const SliderImageSchema = new mongoose.Schema({
  image: {
    url: { 
      type: String, 
      required: [true, 'Image URL is required'],
      trim: true 
    },
    publicId: { 
      type: String, 
      trim: true 
    },
    alt: { 
      type: String, 
      trim: true,
      default: 'Slider Image'
    }
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  buttonText: {
    type: String,
    trim: true,
    maxlength: [50, 'Button text cannot exceed 50 characters'],
    default: 'Shop Now'
  },
  buttonLink: {
    type: String,
    trim: true,
    default: '/shop'
  },
  placement: {
    type: String,
    enum: ['primary', 'secondary', 'both'],
    default: 'primary'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  sortOrder: {
    type: Number,
    default: 0
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

// Indexes for better performance
SliderImageSchema.index({ status: 1, sortOrder: 1 });
SliderImageSchema.index({ createdAt: -1 });

export default mongoose.models.SliderImage || mongoose.model('SliderImage', SliderImageSchema);


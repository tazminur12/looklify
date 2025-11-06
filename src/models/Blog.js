import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    trim: true
  },
  featuredImage: {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  categories: [{
    type: String,
    trim: true
  }],
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  metaKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title cannot exceed 60 characters']
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
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1, publishDate: -1 });
BlogSchema.index({ author: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ isFeatured: 1, sortOrder: 1 });

// Ensure slug is lowercase and URL-friendly
BlogSchema.pre('validate', function(next) {
  if (this.slug) {
    this.slug = this.slug
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  } else if (this.title) {
    this.slug = this.title
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// Virtual for formatted publish date
BlogSchema.virtual('formattedDate').get(function() {
  return this.publishDate ? this.publishDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);


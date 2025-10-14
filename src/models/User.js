import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Staff', 'Support', 'Customer', 'User'],
    default: 'Customer',
  },
  profileImage: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'Bangladesh',
    },
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true,
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
  },
}, {
  timestamps: true,
});

// Index for better query performance
// Note: email index is automatically created by unique: true
UserSchema.index({ role: 1 });

// Virtual for user's full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to check if user has specific role
UserSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Method to check if user is admin (Super Admin or Admin)
UserSchema.methods.isAdmin = function() {
  return ['Super Admin', 'Admin'].includes(this.role);
};

// Method to check if user is staff (Staff or Support)
UserSchema.methods.isStaff = function() {
  return ['Staff', 'Support'].includes(this.role);
};

// Method to check if user is customer
UserSchema.methods.isCustomer = function() {
  return ['Customer', 'User'].includes(this.role);
};

export default models.User || model('User', UserSchema);

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const dogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the dog\'s name'],
    trim: true,
  },
  breed: {
    type: String,
    trim: true,
    default: 'Unknown/Mixed',
  },
  age: { // Consider storing birthDate for more accuracy if needed
    type: Number,
    min: 0,
  },
  color: {
    type: String,
    trim: true,
  },
  description: { // Distinguishing features, temperament etc.
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['Pet', 'Stray', 'Lost', 'Found', 'Adopted'], // Expandable status list
    default: 'Pet',
  },
  // Link to the user who registered/owns the dog
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Reference to the User model
    required: true, // A dog must have an owner/registrar in this system
  },
  registeredBy: { // Could be different from current owner (e.g., shelter staff)
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  uniqueSecureId: { // Added for QR Code linking
    type: String,
    required: true,
    unique: true,
    default: uuidv4, // Automatically generate a UUID v4 on creation
    index: true, // Index for faster lookups
  },
  profileImageUrl: { // Optional: URL for a dog's picture
     type: String,
     // Add validation for URL format if needed
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Middleware to update `updatedAt` field on updates
dogSchema.pre('save', function(next) {
    // Generate uniqueSecureId only if it's a new document and doesn't have one
    // (Default handles this, but explicit check is safe)
    if (this.isNew && !this.uniqueSecureId) {
        this.uniqueSecureId = uuidv4();
    }
    if (!this.isNew) {
      this.updatedAt = Date.now();
    }
    next();
  });

// Optional: Index fields that are frequently queried
dogSchema.index({ owner: 1 });
dogSchema.index({ status: 1 });


const Dog = mongoose.model('Dog', dogSchema);

module.exports = Dog;
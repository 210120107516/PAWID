const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false, // Do not send password back in queries by default
  },
  role: {
    type: String,
    enum: ['Owner', 'ShelterStaff', 'Vet', 'Admin', 'Public'], // Define available roles
    default: 'Owner', // Default role for new registrations
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password Hashing Middleware: Runs before saving a user document
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost factor of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Method to compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (candidatePassword) {
  // 'this.password' refers to the password in the DB (needs to be explicitly selected if needed)
  return await bcrypt.compare(candidatePassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;
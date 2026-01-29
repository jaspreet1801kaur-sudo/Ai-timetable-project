const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  pin: {
    type: String,
    required: [true, 'PIN is required'],
    minlength: [4, 'PIN must be 4 digits'],
    maxlength: [4, 'PIN must be 4 digits'],
    match: [/^\d{4}$/, 'PIN must be 4 digits']
  },
  intention: {
    type: String,
    required: [true, 'Intention is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'professional', 'other'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash PIN before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('pin')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare PIN
userSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};

// Remove sensitive data from JSON response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.pin;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
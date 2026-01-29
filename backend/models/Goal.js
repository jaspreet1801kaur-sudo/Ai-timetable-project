const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
    maxlength: [100, 'Goal name cannot exceed 100 characters']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code']
  },
  category: {
    type: String,
    enum: ['Health', 'Study', 'Personal', 'Career', 'Other'],
    default: 'Other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
goalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Goal', goalSchema);
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Task name is required'],
    trim: true,
    maxlength: [200, 'Task name cannot exceed 200 characters']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  isRepetitive: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex code']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Set points based on difficulty
taskSchema.pre('save', function(next) {
  if (this.difficulty === 'Easy') this.points = 1;
  else if (this.difficulty === 'Medium') this.points = 2;
  else if (this.difficulty === 'Hard') this.points = 3;
  next();
});

// Index for faster queries
taskSchema.index({ userId: 1, goalId: 1 });

module.exports = mongoose.model('Task', taskSchema);
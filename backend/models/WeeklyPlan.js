const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'skipped'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  }
});

const weeklyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  mainFocusDay: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  focusTask: {
    type: String,
    trim: true
  },
  dailyTasks: [dailyTaskSchema],
  reward: {
    type: String,
    trim: true
  },
  punishment: {
    type: String,
    trim: true
  },
  mood: {
    type: String,
    enum: ['energized', 'normal', 'tired', 'stressed'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure only one active plan per user
weeklyPlanSchema.index({ userId: 1, status: 1 });
weeklyPlanSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

// Calculate completion rate
weeklyPlanSchema.methods.calculateCompletionRate = function() {
  if (this.dailyTasks.length === 0) return 0;
  
  const completed = this.dailyTasks.filter(t => t.status === 'completed').length;
  this.completionRate = Math.round((completed / this.dailyTasks.length) * 100);
  return this.completionRate;
};

module.exports = mongoose.model('WeeklyPlan', weeklyPlanSchema);
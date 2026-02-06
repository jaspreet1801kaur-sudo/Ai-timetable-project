const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for logged-in user
 * @access  Protected
 */
router.get('/', protect, async (req, res) => {
  try {
    const { goalId } = req.query;

    const query = { userId: req.user._id };
    if (goalId) query.goalId = goalId;

    const tasks = await Task.find(query)
      .populate('goalId', 'name color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Protected
 */
router.post('/', protect, async (req, res) => {
  try {
    const { goalId, name, difficulty, isRepetitive, color } = req.body;

    if (!goalId || !name || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Goal ID, name, and difficulty are required'
      });
    }

    const task = await Task.create({
      userId: req.user._id,
      goalId,
      name,
      difficulty,
      isRepetitive: isRepetitive || false,
      color
    });

    await task.populate('goalId', 'name color');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Protected
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const { name, difficulty, isRepetitive, color } = req.body;

    if (name) task.name = name;
    if (difficulty) task.difficulty = difficulty;
    if (isRepetitive !== undefined) task.isRepetitive = isRepetitive;
    if (color) task.color = color;

    await task.save();
    await task.populate('goalId', 'name color');

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Protected
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
});

module.exports = router;
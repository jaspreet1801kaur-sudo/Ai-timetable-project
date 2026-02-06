const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Goal = require('../models/Goal');

/**
 * @route   GET /api/goals
 * @desc    Get all goals for logged-in user
 * @access  Protected
 */
router.get('/', protect, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: goals.length,
      goals
    });
  } catch (error) {
    console.error('Get Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Protected
 */
router.post('/', protect, async (req, res) => {
  try {
    const { name, color, category } = req.body;

    if (!name || !color) {
      return res.status(400).json({
        success: false,
        message: 'Name and color are required'
      });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      name,
      color,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/goals/:id
 * @desc    Update a goal
 * @access  Protected
 */
router.put('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const { name, color, category } = req.body;

    if (name) goal.name = name;
    if (color) goal.color = color;
    if (category) goal.category = category;

    await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    console.error('Update Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Protected
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    await goal.deleteOne();

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import AI modules
const { checkFeasibility } = require('../ai/feasibilityCheck');
const { suggestTaskDowngrade } = require('../ai/taskDowngrade');
const { generateWeeklyReflection } = require('../ai/weeklyReflection');
const { checkOverthinking } = require('../ai/overthinkingGuard');
const { callClaude } = require('../ai/claudeAPI');

// ===========================================
// AI TASK GENERATION
// ===========================================
/**
 * @route   POST /api/ai/generate-tasks
 * @desc    Generate tasks from a goal using AI
 * @access  Protected
 */
router.post('/generate-tasks', protect, async (req, res) => {
  try {
    const { goalName, goalCategory } = req.body;

    if (!goalName) {
      return res.status(400).json({
        success: false,
        message: 'Goal name is required'
      });
    }

    const prompt = `You are a student productivity expert. Break down this weekly goal into 5-7 specific, actionable tasks.

Goal: "${goalName}"
Category: ${goalCategory || 'General'}

Requirements:
- Each task should be realistic (30 mins - 2 hours)
- Include variety: studying, practice, projects, review
- Make tasks concrete and measurable
- Consider student energy levels
- Format: One task per line, starting with •

Example format:
• Study chapter concepts for 1 hour
• Complete 10 practice problems
• Create summary notes (30 mins)
• Review with flashcards (45 mins)
• Take practice quiz

Now generate tasks for the goal above:`;

    const aiResponse = await callClaude(prompt, 1500);

    // Parse tasks from response
    const tasks = aiResponse
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[•\-]\s*/, '').trim())
      .filter(task => task.length > 0);

    res.json({
      success: true,
      goalName,
      tasks,
      rawResponse: aiResponse
    });

  } catch (error) {
    console.error('AI Task Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tasks with AI',
      error: error.message
    });
  }
});

// ===========================================
// FEASIBILITY CHECK
// ===========================================
/**
 * @route   POST /api/ai/check-feasibility
 * @desc    Check if weekly plan is feasible
 * @access  Protected
 */
router.post('/check-feasibility', protect, async (req, res) => {
  try {
    const weeklyPlan = req.body;

    if (!weeklyPlan.dailyTasks || weeklyPlan.dailyTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Weekly plan with tasks is required'
      });
    }

    const analysis = await checkFeasibility(weeklyPlan);

    res.json(analysis);

  } catch (error) {
    console.error('Feasibility Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feasibility',
      error: error.message
    });
  }
});

// ===========================================
// TASK DOWNGRADE SUGGESTION
// ===========================================
/**
 * @route   POST /api/ai/suggest-downgrade
 * @desc    Suggest easier alternative for missed task
 * @access  Protected
 */
router.post('/suggest-downgrade', protect, async (req, res) => {
  try {
    const { taskName, difficulty, missedCount } = req.body;

    if (!taskName || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Task name and difficulty are required'
      });
    }

    const suggestion = await suggestTaskDowngrade(
      taskName,
      difficulty,
      missedCount || 2
    );

    res.json(suggestion);

  } catch (error) {
    console.error('Task Downgrade Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate downgrade suggestion',
      error: error.message
    });
  }
});

// ===========================================
// WEEKLY REFLECTION
// ===========================================
/**
 * @route   POST /api/ai/weekly-reflection
 * @desc    Generate end-of-week AI reflection
 * @access  Protected
 */
router.post('/weekly-reflection', protect, async (req, res) => {
  try {
    const weekData = req.body;

    if (!weekData.totalTasks || !weekData.completedTasks) {
      return res.status(400).json({
        success: false,
        message: 'Week summary data is required'
      });
    }

    const reflection = await generateWeeklyReflection(weekData);

    res.json(reflection);

  } catch (error) {
    console.error('Weekly Reflection Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly reflection',
      error: error.message
    });
  }
});

// ===========================================
// OVERTHINKING GUARD
// ===========================================
/**
 * @route   POST /api/ai/check-overthinking
 * @desc    Check if user is overthinking and provide warning
 * @access  Protected
 */
router.post('/check-overthinking', protect, async (req, res) => {
  try {
    const { editCount, daysInactive } = req.body;

    if (editCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Edit count is required'
      });
    }

    const guardResponse = await checkOverthinking(
      editCount,
      daysInactive || 0
    );

    res.json(guardResponse);

  } catch (error) {
    console.error('Overthinking Guard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check overthinking',
      error: error.message
    });
  }
});

// ===========================================
// AI INSIGHTS (General)
// ===========================================
/**
 * @route   POST /api/ai/get-insights
 * @desc    Get general AI insights for weekly plan
 * @access  Protected
 */
router.post('/get-insights', protect, async (req, res) => {
  try {
    const { dailyTasks, mainFocusDay, mood } = req.body;

    if (!dailyTasks || dailyTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Daily tasks are required'
      });
    }

    // Group tasks by day
    const tasksByDay = dailyTasks.reduce((acc, task) => {
      if (!acc[task.day]) acc[task.day] = [];
      acc[task.day].push(task);
      return acc;
    }, {});

    // Calculate workload per day
    const workloadSummary = Object.entries(tasksByDay).map(([day, tasks]) => {
      const load = tasks.length * 2; // Simplified load calculation
      return `${day}: ${tasks.length} tasks (Load: ${load})`;
    }).join('\n');

    const prompt = `You are an AI productivity coach analyzing a student's weekly schedule.

Weekly Overview:
${workloadSummary}

Main Focus Day: ${mainFocusDay}
Current Mood: ${mood}

Provide 3-5 specific, actionable insights to optimize this schedule. Consider:
- Workload distribution
- Task balance across days
- Break recommendations
- Priority adjustments based on mood (${mood})

Keep it concise with bullet points.`;

    const insights = await callClaude(prompt, 1500);

    res.json({
      success: true,
      insights,
      workloadSummary: Object.entries(tasksByDay).map(([day, tasks]) => ({
        day,
        taskCount: tasks.length,
        load: tasks.length * 2
      }))
    });

  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

module.exports = router;
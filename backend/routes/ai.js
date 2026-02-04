const express = require('express');
const router = express.Router();

// Import AI modules
const { checkFeasibility } = require('../ai/feasibilityCheck');
const { suggestTaskDowngrade } = require('../ai/taskDowngrade');
const { generateWeeklyReflection } = require('../ai/weeklyReflection');
const { checkOverthinking } = require('../ai/overthinkingGuard');
const { callAI } = require('../ai/aiAPI');

/*
|--------------------------------------------------------------------------
| AI ROUTES – PHASE 2
| - Authentication DISABLED
| - Database DISABLED
| - Pure AI testing
|--------------------------------------------------------------------------
*/

/* ==========================================
   AI TASK GENERATION
========================================== */
router.post('/generate-tasks', async (req, res) => {
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

Generate tasks now:`;

    const aiResponse = await callAI(prompt);

    const tasks = aiResponse
      .split('\n')
      .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
      .map(line => line.replace(/^[•\-]\s*/, '').trim())
      .filter(Boolean);

    res.json({
      success: true,
      goalName,
      tasks
    });

  } catch (error) {
    console.error('AI Task Generation Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tasks',
      error: error.message
    });
  }
});

/* ==========================================
   FEASIBILITY CHECK
========================================== */
router.post('/check-feasibility', async (req, res) => {
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
    console.error('Feasibility Check Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check feasibility',
      error: error.message
    });
  }
});

/* ==========================================
   TASK DOWNGRADE SUGGESTION
========================================== */
router.post('/suggest-downgrade', async (req, res) => {
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
    console.error('Task Downgrade Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate downgrade suggestion',
      error: error.message
    });
  }
});

/* ==========================================
   WEEKLY REFLECTION
========================================== */
router.post('/weekly-reflection', async (req, res) => {
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
    console.error('Weekly Reflection Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weekly reflection',
      error: error.message
    });
  }
});

/* ==========================================
   OVERTHINKING GUARD
========================================== */
router.post('/check-overthinking', async (req, res) => {
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
    console.error('Overthinking Guard Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to check overthinking',
      error: error.message
    });
  }
});

/* ==========================================
   AI INSIGHTS
========================================== */
router.post('/get-insights', async (req, res) => {
  try {
    const { dailyTasks, mainFocusDay, mood } = req.body;

    if (!dailyTasks || dailyTasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Daily tasks are required'
      });
    }

    const tasksByDay = dailyTasks.reduce((acc, task) => {
      if (!acc[task.day]) acc[task.day] = [];
      acc[task.day].push(task);
      return acc;
    }, {});

    const workloadSummary = Object.entries(tasksByDay)
      .map(([day, tasks]) => `${day}: ${tasks.length} tasks`)
      .join('\n');

    const prompt = `You are a productivity coach.

Weekly workload:
${workloadSummary}

Main focus day: ${mainFocusDay}
Mood: ${mood}

Give 3-5 concise bullet insights to optimize this week.`;

    const insights = await callAI(prompt);

    res.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('AI Insights Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    });
  }
});

module.exports = router;

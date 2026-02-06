const { callAI } = require('./aiAPI');

/**
 * Smart Task Downgrade
 * Suggests lighter alternatives when task is missed repeatedly
 * @param {string} taskName - Original task name
 * @param {string} difficulty - Task difficulty (Easy/Medium/Hard)
 * @param {number} missedCount - How many times missed
 * @returns {Promise<Object>} - Downgrade suggestion (DATA ONLY)
 */
async function suggestTaskDowngrade(taskName, difficulty, missedCount = 2) {
  try {
    const ruleBasedSuggestion = getRuleBasedDowngrade(taskName, difficulty);
    const aiSuggestion = await getAIDowngrade(taskName, difficulty, missedCount);

    return {
      originalTask: taskName,
      difficulty,
      missedCount,
      suggestions: {
        ruleBased: ruleBasedSuggestion,
        aiGenerated: aiSuggestion
      },
      message: `You've missed "${taskName}" ${missedCount} times. Here's an easier alternative to keep momentum.`,
      fallbackMode: false,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Task Downgrade Error:', error);

    const ruleBasedSuggestion = getRuleBasedDowngrade(taskName, difficulty);

    return {
      originalTask: taskName,
      difficulty,
      missedCount,
      suggestions: {
        ruleBased: ruleBasedSuggestion,
        aiGenerated: null
      },
      message: `Consider this easier alternative for "${taskName}".`,
      fallbackMode: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Rule-based downgrade suggestions
 */
function getRuleBasedDowngrade(taskName, difficulty) {
  const taskLower = taskName.toLowerCase();

  if (taskLower.includes('gym') || taskLower.includes('workout')) {
    if (difficulty === 'Hard') return '20-minute light cardio or stretching';
    if (difficulty === 'Medium') return '10-minute walk or yoga';
    return '5-minute stretching or mobility exercises';
  }

  if (taskLower.includes('study') || taskLower.includes('learn') || taskLower.includes('read')) {
    if (difficulty === 'Hard') return 'Review notes for 15 minutes';
    if (difficulty === 'Medium') return 'Skim important topics for 10 minutes';
    return 'Quick 5-minute concept recap';
  }

  if (taskLower.includes('code') || taskLower.includes('program') || taskLower.includes('debug')) {
    if (difficulty === 'Hard') return 'Read documentation or watch a tutorial for 15 minutes';
    if (difficulty === 'Medium') return 'Review core coding concepts for 10 minutes';
    return 'Solve one small coding problem (5–10 minutes)';
  }

  if (taskLower.includes('write') || taskLower.includes('essay') || taskLower.includes('report')) {
    if (difficulty === 'Hard') return 'Create an outline or bullet points only';
    if (difficulty === 'Medium') return 'Write one paragraph or key points';
    return 'Brainstorm ideas for 10 minutes';
  }

  if (taskLower.includes('practice') || taskLower.includes('revision')) {
    if (difficulty === 'Hard') return 'Complete 3 easy problems';
    if (difficulty === 'Medium') return 'Review solved examples';
    return 'Quick concept revision (10 minutes)';
  }

  if (difficulty === 'Hard') return 'Reduce scope to 20–30 minutes of easier work';
  if (difficulty === 'Medium') return 'Reduce task to 15 minutes of simplified work';
  return 'Spend just 10 minutes on the easiest part';
}

/**
 * AI-powered downgrade suggestion
 */
async function getAIDowngrade(taskName, difficulty, missedCount) {
  const prompt = `You are a productivity assistant helping a student who keeps missing tasks.

Original Task: "${taskName}"
Difficulty: ${difficulty}
Times Missed: ${missedCount}

The student needs a lighter, easier alternative so they don’t break their habit.

Rules:
- 10–20 minutes max
- Clearly easier than original
- Still makes progress
- 1–2 sentences only

Suggestion:`;

  const aiResponse = await callAI(prompt);
  return aiResponse.trim();
}

/**
 * Check if task should trigger downgrade
 */
function shouldSuggestDowngrade(missedCount, difficulty) {
  if (difficulty === 'Hard' && missedCount >= 2) return true;
  if (difficulty === 'Medium' && missedCount >= 3) return true;
  if (difficulty === 'Easy' && missedCount >= 4) return true;
  return false;
}

module.exports = {
  suggestTaskDowngrade,
  shouldSuggestDowngrade
};

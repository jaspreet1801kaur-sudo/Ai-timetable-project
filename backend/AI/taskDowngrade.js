const { callAI, handleAIError } = require('./aiAPI');

/**
 * Smart Task Downgrade
 * Suggests lighter alternatives when task is missed repeatedly
 * @param {string} taskName - Original task name
 * @param {string} difficulty - Task difficulty (Easy/Medium/Hard)
 * @param {number} missedCount - How many times missed
 * @returns {Promise<Object>} - Downgrade suggestion
 */
async function suggestTaskDowngrade(taskName, difficulty, missedCount = 2) {
  try {
    // Rule-based downgrade suggestions (fast fallback)
    const ruleBasedSuggestion = getRuleBasedDowngrade(taskName, difficulty);

    // Use AI for better, context-aware suggestions
    const aiSuggestion = await getAIDowngrade(taskName, difficulty, missedCount);

    return {
      success: true,
      originalTask: taskName,
      difficulty,
      missedCount,
      suggestions: {
        ruleBased: ruleBasedSuggestion,
        aiGenerated: aiSuggestion
      },
      message: `You've missed "${taskName}" ${missedCount} times. Here's an easier alternative to keep momentum:`,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Task Downgrade Error:', error);
    
    // Fallback to rule-based only
    const ruleBasedSuggestion = getRuleBasedDowngrade(taskName, difficulty);
    
    return {
      success: true,
      originalTask: taskName,
      suggestions: {
        ruleBased: ruleBasedSuggestion,
        aiGenerated: null
      },
      fallbackMode: true,
      message: `Consider this easier alternative for "${taskName}":`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Rule-based downgrade suggestions
 * @param {string} taskName - Task name
 * @param {string} difficulty - Current difficulty
 * @returns {string} - Suggested downgrade
 */
function getRuleBasedDowngrade(taskName, difficulty) {
  const taskLower = taskName.toLowerCase();

  // Gym/Exercise related
  if (taskLower.includes('gym') || taskLower.includes('workout')) {
    if (difficulty === 'Hard') return '20-minute light cardio or stretching';
    if (difficulty === 'Medium') return '10-minute walk or yoga';
    return '5-minute stretching or mobility exercises';
  }

  // Study related
  if (taskLower.includes('study') || taskLower.includes('learn') || taskLower.includes('read')) {
    if (difficulty === 'Hard') return 'Review notes for 15 minutes';
    if (difficulty === 'Medium') return 'Skim important topics for 10 minutes';
    return 'Quick 5-minute concept recap';
  }

  // Coding/Programming
  if (taskLower.includes('code') || taskLower.includes('program') || taskLower.includes('debug')) {
    if (difficulty === 'Hard') return 'Read documentation or watch tutorial for 15 minutes';
    if (difficulty === 'Medium') return 'Review code concepts for 10 minutes';
    return 'Practice one small coding problem (5-10 mins)';
  }

  // Writing tasks
  if (taskLower.includes('write') || taskLower.includes('essay') || taskLower.includes('report')) {
    if (difficulty === 'Hard') return 'Create outline or bullet points only';
    if (difficulty === 'Medium') return 'Write one paragraph or key points';
    return 'Brainstorm ideas for 10 minutes';
  }

  // Practice/Revision
  if (taskLower.includes('practice') || taskLower.includes('revision')) {
    if (difficulty === 'Hard') return 'Complete 3 easy problems';
    if (difficulty === 'Medium') return 'Review solved examples';
    return 'Quick concept revision (10 mins)';
  }

  // Generic downgrade
  if (difficulty === 'Hard') return 'Reduce scope to 20-30 minutes of easier work';
  if (difficulty === 'Medium') return 'Reduce to 15 minutes of simplified version';
  return 'Spend just 10 minutes on the easiest part';
}

/**
 * AI-powered downgrade suggestion
 * @param {string} taskName - Task name
 * @param {string} difficulty - Difficulty level
 * @param {number} missedCount - Times missed
 * @returns {Promise<string>} - AI suggestion
 */
async function getAIDowngrade(taskName, difficulty, missedCount) {
  const prompt = `You are a productivity assistant helping a student who keeps missing tasks.

Original Task: "${taskName}"
Difficulty: ${difficulty}
Times Missed: ${missedCount}

The student needs a lighter, easier alternative to this task so they don't break their habit completely.

Provide ONE specific, actionable suggestion that:
- Takes 10-20 minutes maximum
- Is significantly easier than the original
- Maintains some progress toward the goal
- Feels achievable when motivation is low

Format: Just the suggestion, 1-2 sentences maximum.

Example good suggestions:
- Instead of "Gym workout" → "10-minute walk or light stretching"
- Instead of "Study 2 hours" → "Review flashcards for 15 minutes"
- Instead of "Complete assignment" → "Work on outline for 20 minutes"

Your suggestion:`;

  const aiResponse = await callClaude(prompt, 200);
  return aiResponse.trim();
}

/**
 * Check if task should trigger downgrade
 * @param {number} missedCount - Times missed
 * @param {string} difficulty - Task difficulty
 * @returns {boolean} - Should suggest downgrade
 */
function shouldSuggestDowngrade(missedCount, difficulty) {
  // Hard tasks: suggest after 2 misses
  if (difficulty === 'Hard' && missedCount >= 2) return true;
  
  // Medium tasks: suggest after 3 misses
  if (difficulty === 'Medium' && missedCount >= 3) return true;
  
  // Easy tasks: suggest after 4 misses
  if (difficulty === 'Easy' && missedCount >= 4) return true;
  
  return false;
}

module.exports = {
  suggestTaskDowngrade,
  shouldSuggestDowngrade
};
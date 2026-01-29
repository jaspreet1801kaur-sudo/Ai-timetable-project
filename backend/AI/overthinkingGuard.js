const { callClaude } = require('./claudeAPI');

/**
 * Anti-Overthinking Guard
 * Detects excessive planning and encourages execution
 * @param {number} editCount - Number of plan edits
 * @param {number} daysInactive - Days since last task completion
 * @returns {Promise<Object>} - Guard response
 */
async function checkOverthinking(editCount, daysInactive = 0) {
  try {
    // Rule-based thresholds
    const isOverthinking = editCount >= 5;
    const isSevereOverthinking = editCount >= 10;
    const longInactive = daysInactive >= 3;

    if (!isOverthinking && !longInactive) {
      return {
        success: true,
        triggered: false,
        message: null
      };
    }

    // Generate appropriate message
    let message;
    let severity;

    if (isSevereOverthinking) {
      message = await generateAIWarning(editCount, 'severe');
      severity = 'severe';
    } else if (isOverthinking) {
      message = await generateAIWarning(editCount, 'moderate');
      severity = 'moderate';
    } else if (longInactive) {
      message = getInactivityMessage(daysInactive);
      severity = 'inactive';
    }

    return {
      success: true,
      triggered: true,
      severity,
      editCount,
      daysInactive,
      message,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Overthinking Guard Error:', error);
    
    // Fallback to rule-based messages
    return {
      success: true,
      triggered: editCount >= 5,
      severity: editCount >= 10 ? 'severe' : 'moderate',
      message: getRuleBasedWarning(editCount),
      fallbackMode: true
    };
  }
}

/**
 * Generate AI warning message
 */
async function generateAIWarning(editCount, severity) {
  const prompt = `You are a productivity coach. A student has edited their weekly plan ${editCount} times.

This is a sign of overthinking and planning paralysis.

Generate a firm but friendly one-sentence message to:
1. Acknowledge they've planned enough
2. Push them to start executing
3. ${severity === 'severe' ? 'Be very direct and motivating' : 'Be gentle but clear'}

Keep it under 20 words. Make it memorable and actionable.

Examples:
- "Planning band karo, kaam shuru karo. Execution beats perfection."
- "You've refined this ${editCount} times. Time to DO, not just plan."
- "Stop tweaking. Start working. Progress > Perfect plans."

Your message:`;

  const aiResponse = await callClaude(prompt, 100);
  return aiResponse.trim().replace(/['"]/g, '');
}

/**
 * Rule-based warning messages
 */
function getRuleBasedWarning(editCount) {
  if (editCount >= 10) {
    return '🛑 STOP PLANNING! You\'ve edited this 10+ times. Start executing NOW.';
  }
  
  if (editCount >= 7) {
    return '⚠️ Too much planning. Time to take action. Execution beats perfection.';
  }
  
  if (editCount >= 5) {
    return '💭 You\'ve planned enough. Start working on your first task right now.';
  }
  
  return '📝 Your plan looks good. Time to execute!';
}

/**
 * Inactivity warning message
 */
function getInactivityMessage(daysInactive) {
  if (daysInactive >= 7) {
    return '⏰ It\'s been a week! Your plan is waiting. Start with the easiest task today.';
  }
  
  if (daysInactive >= 5) {
    return '⏰ 5 days without action. Don\'t let the plan gather dust. Begin now!';
  }
  
  return '⏰ 3+ days inactive. Even 10 minutes of work keeps momentum alive.';
}

/**
 * Check if user should be warned
 */
function shouldWarnUser(editCount, daysInactive) {
  return editCount >= 5 || daysInactive >= 3;
}

/**
 * Get severity level
 */
function getSeverityLevel(editCount, daysInactive) {
  if (editCount >= 10) return 'critical';
  if (editCount >= 7 || daysInactive >= 7) return 'severe';
  if (editCount >= 5 || daysInactive >= 3) return 'moderate';
  return 'none';
}

/**
 * Generate execution nudge
 * Simple reminder to start working
 */
function getExecutionNudge() {
  const nudges = [
    '✅ Start with your easiest task right now',
    '⚡ 10 minutes of action > hours of planning',
    '🎯 Pick one task and begin. Don\'t think, just do.',
    '💪 Momentum starts with one small step today',
    '🚀 The best plan is the one you actually execute'
  ];
  
  return nudges[Math.floor(Math.random() * nudges.length)];
}

module.exports = {
  checkOverthinking,
  shouldWarnUser,
  getSeverityLevel,
  getExecutionNudge
};
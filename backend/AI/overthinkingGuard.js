const { callAI } = require('./aiAPI');

/**
 * Anti-Overthinking Guard
 * Detects excessive planning and encourages execution
 * @param {number} editCount - Number of plan edits
 * @param {number} daysInactive - Days since last task completion
 * @returns {Promise<Object>} - Guard result (DATA ONLY)
 */
async function checkOverthinking(editCount, daysInactive = 0) {
  try {
    const isOverthinking = editCount >= 5;
    const isSevereOverthinking = editCount >= 10;
    const longInactive = daysInactive >= 3;

    if (!isOverthinking && !longInactive) {
      return {
        triggered: false,
        message: null
      };
    }

    let message;
    let severity;

    if (isSevereOverthinking) {
      message = await generateAIWarning(editCount, 'severe');
      severity = 'severe';
    } else if (isOverthinking) {
      message = await generateAIWarning(editCount, 'moderate');
      severity = 'moderate';
    } else {
      message = getInactivityMessage(daysInactive);
      severity = 'inactive';
    }

    return {
      triggered: true,
      severity,
      editCount,
      daysInactive,
      message,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Overthinking Guard Error:', error.message);

    return {
      triggered: editCount >= 5 || daysInactive >= 3,
      severity: editCount >= 10 ? 'severe' : 'moderate',
      message: getRuleBasedWarning(editCount),
      fallbackMode: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate AI warning message
 */
async function generateAIWarning(editCount, severity) {
  const prompt = `You are a productivity coach. A student has edited their weekly plan ${editCount} times.

This indicates overthinking and planning paralysis.

Write ONE short sentence that:
1. Confirms they planned enough
2. Pushes them to start executing
3. ${severity === 'severe' ? 'Be direct and motivating' : 'Be gentle but clear'}

Rules:
- Max 20 words
- Action-focused
- No quotes

Message:`;

  const response = await callAI(prompt);
  return response.trim().replace(/['"]/g, '');
}

/**
 * Rule-based warning messages
 */
function getRuleBasedWarning(editCount) {
  if (editCount >= 10) {
    return '🛑 STOP PLANNING! You’ve edited this too many times. Start executing NOW.';
  }
  if (editCount >= 7) {
    return '⚠️ Too much planning. Time to take action.';
  }
  if (editCount >= 5) {
    return '💭 You’ve planned enough. Start working on your first task now.';
  }
  return '📝 Your plan looks good. Time to execute!';
}

/**
 * Inactivity warning message
 */
function getInactivityMessage(daysInactive) {
  if (daysInactive >= 7) {
    return '⏰ It’s been a week. Start with the easiest task today.';
  }
  if (daysInactive >= 5) {
    return '⏰ 5 days inactive. Don’t lose momentum.';
  }
  return '⏰ 3+ days inactive. Even 10 minutes helps.';
}

/**
 * Utility helpers (pure logic)
 */
function shouldWarnUser(editCount, daysInactive) {
  return editCount >= 5 || daysInactive >= 3;
}

function getSeverityLevel(editCount, daysInactive) {
  if (editCount >= 10) return 'critical';
  if (editCount >= 7 || daysInactive >= 7) return 'severe';
  if (editCount >= 5 || daysInactive >= 3) return 'moderate';
  return 'none';
}

function getExecutionNudge() {
  const nudges = [
    '✅ Start with your easiest task now',
    '⚡ Action beats planning',
    '🎯 Pick one task and begin',
    '💪 Momentum starts today',
    '🚀 Execute first, refine later'
  ];
  return nudges[Math.floor(Math.random() * nudges.length)];
}

module.exports = {
  checkOverthinking,
  shouldWarnUser,
  getSeverityLevel,
  getExecutionNudge
};

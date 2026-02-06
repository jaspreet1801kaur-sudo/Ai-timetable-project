const { callAIStructured, handleAIError } = require('./aiAPI');

/**
 * AI Goal Feasibility Checker
 * @param {Object} weeklyPlan
 * @returns {Promise<Object>} - Feasibility result (DATA ONLY)
 */
async function checkFeasibility(weeklyPlan) {
  try {
    const ruleBasedAnalysis = performRuleBasedChecks(weeklyPlan);

    if (ruleBasedAnalysis.hasIssues) {
      const aiAnalysis = await performAIAnalysis(weeklyPlan);

      return {
        feasible: ruleBasedAnalysis.feasible,
        ruleBasedChecks: ruleBasedAnalysis,
        aiSuggestions: aiAnalysis,
        timestamp: new Date().toISOString()
      };
    }

    return {
      feasible: true,
      ruleBasedChecks: ruleBasedAnalysis,
      aiSuggestions: 'Your weekly plan looks well-balanced!',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Feasibility Check Error:', error);

    return {
      feasible: false,
      error: handleAIError(error),
      ruleBasedChecks: performRuleBasedChecks(weeklyPlan),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Rule-based checks
 */
function performRuleBasedChecks(weeklyPlan) {
  const { dailyTasks = [], mood } = weeklyPlan;

  const tasksByDay = groupTasksByDay(dailyTasks);
  const dailyLoads = calculateDailyLoads(tasksByDay);

  const heavyDays = dailyLoads.filter(d => d.load >= 7).map(d => d.day);
  const emptyDays = dailyLoads.filter(d => d.load === 0).map(d => d.day);

  const totalLoad = dailyLoads.reduce((sum, d) => sum + d.load, 0);
  const avgLoad = totalLoad / 7;

  const analysis = {
    totalTasks: dailyTasks.length,
    totalLoad,
    averageLoad: Math.round(avgLoad * 10) / 10,
    heavyDays,
    emptyDays,
    dailyBreakdown: dailyLoads,
    hasIssues: heavyDays.length > 0 || avgLoad > 5,
    feasible: avgLoad <= 6 && heavyDays.length <= 2,
    warnings: []
  };

  if (heavyDays.length > 0) {
    analysis.warnings.push(`Heavy days detected: ${heavyDays.join(', ')}`);
  }
  if (avgLoad > 5) {
    analysis.warnings.push('Overall weekly load is high');
  }
  if (mood === 'tired' || mood === 'stressed') {
    analysis.warnings.push(`Mood is ${mood}. Consider reducing workload`);
  }

  return analysis;
}

/**
 * AI-powered analysis
 */
async function performAIAnalysis(weeklyPlan) {
  const { dailyTasks = [], mainFocusDay, mood } = weeklyPlan;

  const tasksByDay = groupTasksByDay(dailyTasks);
  const dailyLoads = calculateDailyLoads(tasksByDay);

  const prompt = `You are a productivity AI analyzing a weekly plan.

Main Focus Day: ${mainFocusDay}
Mood: ${mood}
Total Tasks: ${dailyTasks.length}

Daily Breakdown:
${dailyLoads.map(d => `${d.day}: ${d.taskCount} tasks (Load ${d.load})`).join('\n')}

Provide:
1) Is it feasible?
2) Overloaded days
3) 2-3 improvement suggestions`;

  return await callAIStructured(prompt, 1000);
}

/**
 * Helpers
 */
function groupTasksByDay(dailyTasks) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const grouped = {};
  days.forEach(day => {
    grouped[day] = dailyTasks.filter(t => t.day === day);
  });
  return grouped;
}

function calculateDailyLoads(tasksByDay) {
  return Object.keys(tasksByDay).map(day => {
    const taskCount = tasksByDay[day].length;
    const load = taskCount * 2;

    let label = 'Balanced';
    if (load === 0) label = 'Free';
    else if (load <= 3) label = 'Light';
    else if (load >= 7) label = 'Heavy';

    return { day, taskCount, load, label };
  });
}

module.exports = {
  checkFeasibility
};

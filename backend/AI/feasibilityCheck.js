const { callAIStructured, handleAIError } = require('./aiAPI');

/**
 * AI Goal Feasibility Checker
 * Analyzes if weekly plan is realistic and well-distributed
 * @param {Object} weeklyPlan - The weekly plan data
 * @returns {Promise<Object>} - Feasibility analysis
 */
async function checkFeasibility(weeklyPlan) {
  try {
    // Rule-based checks first (fast, no AI needed)
    const ruleBasedAnalysis = performRuleBasedChecks(weeklyPlan);

    // If major issues detected, use AI for detailed analysis
    if (ruleBasedAnalysis.hasIssues) {
      const aiAnalysis = await performAIAnalysis(weeklyPlan);
      return {
        success: true,
        feasible: ruleBasedAnalysis.feasible,
        ruleBasedChecks: ruleBasedAnalysis,
        aiSuggestions: aiAnalysis,
        timestamp: new Date().toISOString()
      };
    }

    // Plan looks good, return rule-based analysis only
    return {
      success: true,
      feasible: true,
      ruleBasedChecks: ruleBasedAnalysis,
      aiSuggestions: 'Your weekly plan looks well-balanced! 🎯',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Feasibility Check Error:', error);
    return {
      success: false,
      error: handleAIError(error),
      ruleBasedChecks: performRuleBasedChecks(weeklyPlan)
    };
  }
}

/**
 * Perform rule-based checks (no AI required)
 * @param {Object} weeklyPlan - Weekly plan data
 * @returns {Object} - Analysis results
 */
function performRuleBasedChecks(weeklyPlan) {
  const { dailyTasks, mood } = weeklyPlan;
  
  // Group tasks by day
  const tasksByDay = groupTasksByDay(dailyTasks);
  
  // Calculate load per day
  const dailyLoads = calculateDailyLoads(tasksByDay);
  
  // Identify issues
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
    feasible: avgLoad <= 6 && heavyDays.length <= 2
  };

  // Generate warnings
  analysis.warnings = [];
  if (heavyDays.length > 0) {
    analysis.warnings.push(`⚠️ Heavy days detected: ${heavyDays.join(', ')}`);
  }
  if (avgLoad > 5) {
    analysis.warnings.push('⚠️ Overall weekly load is high');
  }
  if (mood === 'tired' || mood === 'stressed') {
    analysis.warnings.push(`⚠️ Your mood is ${mood} - consider reducing task load`);
  }

  return analysis;
}

/**
 * Perform AI-powered analysis
 * @param {Object} weeklyPlan - Weekly plan data
 * @returns {Promise<string>} - AI suggestions
 */
async function performAIAnalysis(weeklyPlan) {
  const { dailyTasks, mainFocusDay, mood } = weeklyPlan;
  
  // Group tasks by day for AI analysis
  const tasksByDay = groupTasksByDay(dailyTasks);
  const dailyLoads = calculateDailyLoads(tasksByDay);

  // Create prompt for Claude
  const prompt = `You are a productivity AI assistant analyzing a student's weekly plan.

Weekly Plan Summary:
Main Focus Day: ${mainFocusDay}
Current Mood: ${mood}
Total Tasks: ${dailyTasks.length}

Daily Breakdown:
${dailyLoads.map(d => `${d.day}: ${d.taskCount} tasks (Load: ${d.load} points) - ${d.label}`).join('\n')}

Task Difficulty Points: Easy = 1, Medium = 2, Hard = 3

Analyze this plan and provide:
1. Is it feasible?
2. Which days are overloaded?
3. 2-3 specific suggestions to improve balance

Respond in short bullet points only.`;

  const aiResponse = await callAIStructured(prompt, 1000);
  return aiResponse;
}

/**
 * Group tasks by day of week
 */
function groupTasksByDay(dailyTasks) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const grouped = {};
  
  days.forEach(day => {
    grouped[day] = dailyTasks.filter(t => t.day === day);
  });
  
  return grouped;
}

/**
 * Calculate daily cognitive loads
 */
function calculateDailyLoads(tasksByDay) {
  const days = Object.keys(tasksByDay);
  
  return days.map(day => {
    const tasks = tasksByDay[day];
    const taskCount = tasks.length;
    
    // For now, assume average points of 2 per task
    // In real implementation, fetch actual task difficulty
    const load = taskCount * 2;
    
    let label = 'Balanced';
    if (load === 0) label = 'Free';
    else if (load <= 3) label = 'Light';
    else if (load >= 7) label = 'Heavy';
    
    return {
      day,
      taskCount,
      load,
      label
    };
  });
}

module.exports = {
  checkFeasibility
};
const { callAIStructured, handleAIError } = require('./aiAPI');

/**
 * Weekly AI Reflection
 * Generates end-of-week analysis and suggestions
 * @param {Object} weekData - Week completion data
 * @returns {Promise<Object>} - Reflection analysis
 */
async function generateWeeklyReflection(weekData) {
  try {
    const {
      totalTasks,
      completedTasks,
      missedTasks,
      taskBreakdown,
      mood,
      mainFocusDay
    } = weekData;

    // Calculate basic metrics
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    
    // Generate AI reflection
    const aiReflection = await generateAIReflection(weekData);
    
    // Parse AI response into sections
    const sections = parseReflectionSections(aiReflection);

    return {
      success: true,
      weekSummary: {
        totalTasks,
        completedTasks,
        missedTasks,
        completionRate,
        mood,
        mainFocusDay
      },
      reflection: sections,
      rawAIResponse: aiReflection,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Weekly Reflection Error:', error);
    
    // Fallback to rule-based reflection
    const fallbackReflection = generateFallbackReflection(weekData);
    
    return {
      success: true,
      weekSummary: {
        totalTasks: weekData.totalTasks,
        completedTasks: weekData.completedTasks,
        completionRate: Math.round((weekData.completedTasks / weekData.totalTasks) * 100)
      },
      reflection: fallbackReflection,
      fallbackMode: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Generate AI-powered reflection
 */
async function generateAIReflection(weekData) {
  const {
    totalTasks,
    completedTasks,
    missedTasks,
    taskBreakdown,
    mood,
    mainFocusDay
  } = weekData;

  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  // Build detailed task breakdown
  const missedTasksList = taskBreakdown
    .filter(t => t.status === 'skipped')
    .map(t => `- ${t.taskName} (${t.day})`)
    .join('\n');

  const completedTasksList = taskBreakdown
    .filter(t => t.status === 'completed')
    .map(t => `- ${t.taskName} (${t.day})`)
    .join('\n');

  const prompt = `You are an AI productivity coach providing a weekly reflection for a student.

Weekly Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tasks: ${totalTasks}
Completed: ${completedTasks} (${completionRate}%)
Missed: ${missedTasks}
Main Focus Day: ${mainFocusDay}
Mood State: ${mood}

Completed Tasks:
${completedTasksList || 'None'}

Missed Tasks:
${missedTasksList || 'None'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate a reflection with these sections:

**What Went Well:**
- Highlight achievements
- Recognize patterns of success

**What Went Wrong:**
- Identify missed tasks
- Note consistency issues

**Possible Reasons:**
- Analyze why tasks were missed
- Consider mood and workload factors

**Suggestions for Next Week:**
- Give 2-3 specific, actionable improvements
- Be encouraging and realistic

Keep each section to 2-3 bullet points. Be honest but supportive.`;

  const aiResponse = await callClaudeStructured(prompt, 2000);
  return aiResponse;
}

/**
 * Parse AI response into structured sections
 */
function parseReflectionSections(aiResponse) {
  const sections = {
    whatWentWell: [],
    whatWentWrong: [],
    possibleReasons: [],
    suggestions: []
  };

  const lines = aiResponse.split('\n').filter(line => line.trim());

  let currentSection = null;

  lines.forEach(line => {
    const cleanLine = line.trim();

    // Detect section headers
    if (cleanLine.toLowerCase().includes('what went well')) {
      currentSection = 'whatWentWell';
    } else if (cleanLine.toLowerCase().includes('what went wrong')) {
      currentSection = 'whatWentWrong';
    } else if (cleanLine.toLowerCase().includes('possible reasons')) {
      currentSection = 'possibleReasons';
    } else if (cleanLine.toLowerCase().includes('suggestions')) {
      currentSection = 'suggestions';
    }
    // Add content to current section
    else if (currentSection && (cleanLine.startsWith('-') || cleanLine.startsWith('•') || cleanLine.startsWith('*'))) {
      const content = cleanLine.replace(/^[-•*]\s*/, '').trim();
      if (content) {
        sections[currentSection].push(content);
      }
    }
  });

  return sections;
}

/**
 * Generate fallback reflection (rule-based)
 */
function generateFallbackReflection(weekData) {
  const { totalTasks, completedTasks, missedTasks, mood } = weekData;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  const sections = {
    whatWentWell: [],
    whatWentWrong: [],
    possibleReasons: [],
    suggestions: []
  };

  // What went well
  if (completionRate >= 80) {
    sections.whatWentWell.push('Excellent completion rate - you stayed consistent!');
    sections.whatWentWell.push('Strong commitment to your goals this week');
  } else if (completionRate >= 60) {
    sections.whatWentWell.push('Good progress on majority of tasks');
    sections.whatWentWell.push('Maintained momentum despite challenges');
  } else {
    sections.whatWentWell.push(`Completed ${completedTasks} tasks - that's still progress`);
  }

  // What went wrong
  if (missedTasks > 0) {
    sections.whatWentWrong.push(`${missedTasks} tasks were skipped or incomplete`);
    
    if (completionRate < 50) {
      sections.whatWentWrong.push('More than half of planned tasks were missed');
    }
  }

  // Possible reasons
  if (mood === 'tired' || mood === 'stressed') {
    sections.possibleReasons.push(`Your mood (${mood}) may have impacted energy levels`);
  }
  if (completionRate < 50) {
    sections.possibleReasons.push('Weekly plan may have been too ambitious');
  }

  // Suggestions
  sections.suggestions.push('Start with smaller, achievable tasks to build momentum');
  sections.suggestions.push('Focus on consistency over perfection');
  
  if (completionRate < 70) {
    sections.suggestions.push('Reduce task difficulty or quantity for next week');
  }

  return sections;
}

module.exports = {
  generateWeeklyReflection
};
document.addEventListener("DOMContentLoaded", function () {

/* ==================== GLOBAL STATE ==================== */
let slide = 0;
const slides = document.querySelectorAll(".slide");
const bar = document.getElementById("bar");

let currentUser = null;
let goals = [];
let allTasks = [];
let weeklyPlan = null;

/* ==================== UI NAVIGATION ==================== */
function updateUI() {
  slides.forEach((s, i) => s.classList.toggle("active", i === slide));
  const progress = slide === 0 ? 0 : ((slide) / (slides.length - 1)) * 100;
  bar.style.width = progress + "%";
  
  // Update user profile display
  if (currentUser && slide > 0) {
    document.getElementById("userProfile").style.display = "flex";
    document.getElementById("userNameDisplay").textContent = currentUser.name;
  }
}

function next() {
  if (slide < slides.length - 1) {
    saveProgress();
    slide++;
    updateUI();
  }
}

function back() {
  if (slide > 0) {
    slide--;
    updateUI();
  }
}

/* ==================== NOTIFICATIONS ==================== */
function showNotification(message, type = 'info') {
  const container = document.getElementById('notificationContainer');
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span class="notification-text">${message}</span>
  `;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* ==================== AUTHENTICATION ==================== */
function showNewUser() {
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("newUserForm").style.display = "block";
}

function showExistingUser() {
  const saved = localStorage.getItem("focusUser");
  if (!saved) {
    showNotification("No user found. Please create an account first.", "error");
    return;
  }
  
  const user = JSON.parse(saved);
  document.getElementById("userGreeting").innerHTML = `
    <p class="greeting-text">Welcome back, <strong>${user.name}</strong>!</p>
    <p class="intention-text">Your intention: <em>${user.intent}</em></p>
  `;
  
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("existingUserForm").style.display = "block";
}

function registerUser() {
  const name = document.getElementById("userName").value.trim();
  const intent = document.getElementById("userIntent").value.trim();
  const pin = document.getElementById("userPin").value.trim();
  
  if (!name) {
    showNotification("Please enter your name", "error");
    return;
  }
  if (!intent) {
    showNotification("Please enter your intention", "error");
    return;
  }
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    showNotification("PIN must be exactly 4 digits", "error");
    return;
  }
  
  const user = { name, intent, pin, createdAt: new Date().toISOString() };
  localStorage.setItem("focusUser", JSON.stringify(user));
  currentUser = user;
  
  showNotification(`Welcome, ${name}! Let's start planning.`, "success");
  slide = 1;
  updateUI();
}

function loginUser() {
  const saved = localStorage.getItem("focusUser");
  if (!saved) {
    showNotification("No user found", "error");
    return;
  }
  
  const user = JSON.parse(saved);
  const pin = document.getElementById("loginPin").value.trim();
  
  if (pin !== user.pin) {
    showNotification("Incorrect PIN. Please try again.", "error");
    return;
  }
  
  currentUser = user;
  loadSavedPlan();
  
  showNotification(`Welcome back, ${user.name}!`, "success");
  slide = 1;
  updateUI();
}

function logout() {
  if (confirm("Are you sure you want to logout? Make sure to export your plan if needed.")) {
    currentUser = null;
    goals = [];
    allTasks = [];
    weeklyPlan = null;
    slide = 0;
    
    document.getElementById("goalInput").value = "";
    document.getElementById("reward").value = "";
    document.getElementById("punishment").value = "";
    document.getElementById("focusTask").value = "";
    
    document.getElementById("authButtons").style.display = "flex";
    document.getElementById("newUserForm").style.display = "none";
    document.getElementById("existingUserForm").style.display = "none";
    document.getElementById("userProfile").style.display = "none";
    
    updateUI();
    showNotification("Logged out successfully", "info");
  }
}

function backToAuth() {
  document.getElementById("authButtons").style.display = "flex";
  document.getElementById("newUserForm").style.display = "none";
  document.getElementById("existingUserForm").style.display = "none";
}

/* ==================== GOALS MANAGEMENT ==================== */
function addGoal() {
  const input = document.getElementById("goalInput");
  const color = document.getElementById("goalColor").value;
  
  if (!input.value.trim()) {
    showNotification("Please enter a goal", "error");
    return;
  }
  
  goals.push({ 
    id: Date.now(),
    name: input.value.trim(), 
    color,
    createdAt: new Date().toISOString()
  });
  
  input.value = "";
  document.getElementById("goalColor").value = getRandomColor();
  
  renderGoals();
  showNotification("Goal added successfully!", "success");
}

function deleteGoal(index) {
  if (confirm(`Delete goal: "${goals[index].name}"?`)) {
    goals.splice(index, 1);
    renderGoals();
    showNotification("Goal deleted", "info");
  }
}

function renderGoals() {
  const goalsContainer = document.getElementById("goals");
  const tasksArea = document.getElementById("tasksArea");
  
  if (goals.length === 0) {
    goalsContainer.innerHTML = `
      <div class="empty-state">
        <p>🎯 No goals yet. Add your first goal above!</p>
      </div>
    `;
    tasksArea.innerHTML = "";
    return;
  }
  
  goalsContainer.innerHTML = goals.map((g, i) => `
    <div class="goal-box" data-index="${i}">
      <div class="goal-header">
        <strong class="goal-name">${g.name}</strong>
        <span class="delete" onclick="deleteGoal(${i})">✕</span>
      </div>
      <div class="color-bar" style="background:${g.color}"></div>
    </div>
  `).join("");

  tasksArea.innerHTML = goals.map((g, i) => `
    <div class="goal-task-box">
      <div class="goal-header">
        <strong class="goal-name">${g.name}</strong>
        <div class="color-indicator" style="background:${g.color}"></div>
      </div>
      
      <button class="ai-generate-btn" onclick="generateTasksWithAI(${i})">
        <span class="btn-icon">✨</span>
        Generate Tasks with AI
      </button>
      
      <div id="aiStatus${i}" class="ai-status"></div>
      
      <textarea 
        id="tasks${i}" 
        placeholder="Add tasks manually (one per line):
• Study concepts for 1 hour
• Complete practice exercises
• Review and take notes
        
Or click 'Generate with AI' above!"
        rows="5"
      ></textarea>
      
      <div class="task-tips">
        💡 Tip: Be specific about duration and action (e.g., "Study for 30 mins" not just "Study")
      </div>
    </div>
  `).join("");
}

function getRandomColor() {
  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
    '#F44336', '#00BCD4', '#FFEB3B', '#E91E63',
    '#3F51B5', '#009688', '#FF5722', '#673AB7'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* ==================== AI TASK GENERATION ==================== */
async function generateTasksWithAI(index) {
  const goal = goals[index];
  const statusEl = document.getElementById(`aiStatus${index}`);
  const textarea = document.getElementById(`tasks${index}`);
  
  statusEl.innerHTML = `
    <div class="ai-loading">
      <span class="spinner"></span>
      <span>AI is generating tasks for "${goal.name}"...</span>
    </div>
  `;
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `You are a student productivity expert. Break down this weekly goal into 5-7 specific, actionable tasks.

Goal: "${goal.name}"

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

Now generate tasks for the goal above:`
        }]
      })
    });

    const data = await response.json();
    const tasks = data.content[0].text.trim();
    
    textarea.value = tasks;
    statusEl.innerHTML = `
      <div class="ai-success">
        <span>✅</span>
        <span>Tasks generated successfully!</span>
      </div>
    `;
    
    setTimeout(() => statusEl.innerHTML = "", 3000);
    showNotification("AI generated tasks successfully!", "success");
    
  } catch (error) {
    console.error('AI generation failed:', error);
    statusEl.innerHTML = `
      <div class="ai-error">
        <span>❌</span>
        <span>AI generation failed. Please add tasks manually.</span>
      </div>
    `;
    showNotification("AI generation failed. Try adding tasks manually.", "error");
  }
}

/* ==================== TASK BATCHING ==================== */
function prepareBatch() {
  if (goals.length === 0) {
    showNotification("Please add at least one goal first", "error");
    return;
  }
  
  allTasks = [];
  const batch = document.getElementById("batchArea");
  batch.innerHTML = "";
  
  let hasContent = false;
  
  goals.forEach((goal, i) => {
    const textarea = document.getElementById("tasks" + i);
    if (!textarea) return;
    
    const lines = textarea.value
      .split("\n")
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(x => x);
    
    if (lines.length > 0) hasContent = true;
    
    lines.forEach(task => {
      const id = allTasks.length;
      allTasks.push({
        id: Date.now() + id,
        task,
        goal: goal.name,
        goalId: goal.id,
        color: goal.color,
        deleted: false,
        effort: 3,
        days: []
      });
      
      batch.innerHTML += `
        <div class="task-batch-box" id="task${id}">
          <div class="task-header">
            <strong class="task-name">${task}</strong>
            <span class="delete" onclick="deleteTask(${id})">✕</span>
          </div>
          
          <div class="task-meta">
            <span class="goal-badge" style="background:${goal.color}20;color:${goal.color}">
              ${goal.name}
            </span>
          </div>
          
          <div class="color-bar" id="bar${id}" style="background:${goal.color}"></div>
          
          <div class="color-picker-row">
            <label>Task Color:</label>
            <input type="color" id="color${id}" value="${goal.color}" onchange="updateColor(${id})">
          </div>
          
          <div class="days-selector">
            <label class="days-label">Select Days:</label>
            <div class="days-grid">
              ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `
                <label class="day-checkbox">
                  <input type="checkbox" id="${id}${d}" onchange="updateTaskDays(${id})">
                  <span class="day-label">${d}</span>
                </label>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    });
  });
  
  if (!hasContent) {
    showNotification("Please add tasks for your goals before continuing", "error");
    return;
  }
  
  next();
}

function updateColor(id) {
  const color = document.getElementById("color" + id).value;
  document.getElementById("bar" + id).style.background = color;
  if (allTasks[id]) {
    allTasks[id].color = color;
  }
}

function updateTaskDays(id) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (allTasks[id]) {
    allTasks[id].days = days.filter(d => {
      const checkbox = document.getElementById(id + d);
      return checkbox && checkbox.checked;
    });
  }
}

function deleteTask(id) {
  if (confirm("Delete this task?")) {
    allTasks[id].deleted = true;
    const taskEl = document.getElementById("task" + id);
    if (taskEl) taskEl.remove();
    showNotification("Task deleted", "info");
  }
}

/* ==================== GENERATE TIMETABLE ==================== */
async function generate() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const table = {};
  const legendMap = {};
  
  days.forEach(d => table[d] = []);
  
  // Collect tasks per day
  allTasks.forEach((t, i) => {
    if (t.deleted) return;
    
    const color = document.getElementById("color" + i)?.value || t.color;
    t.color = color;
    
    if (!legendMap[t.goal]) legendMap[t.goal] = color;
    
    days.forEach(d => {
      const checkbox = document.getElementById(i + d);
      if (checkbox && checkbox.checked) {
        table[d].push({ ...t, index: i });
      }
    });
  });
  
  // Display reward and punishment
  const reward = document.getElementById("reward").value || "Not specified";
  const punishment = document.getElementById("punishment").value || "Not specified";
  document.getElementById("rewardDisplay").textContent = reward;
  document.getElementById("punishmentDisplay").textContent = punishment;
  
  // Render timetable
  const grid = document.getElementById("table");
  grid.innerHTML = "";
  
  const focusTaskName = document.getElementById("focusTask").value.trim().toLowerCase();
  
  days.forEach(d => {
    const dayTasks = table[d];
    const taskCount = dayTasks.length;
    
    grid.innerHTML += `
      <div class="day-column">
        <div class="day-header">
          <h4>${d}</h4>
          <span class="task-count">${taskCount} task${taskCount !== 1 ? 's' : ''}</span>
        </div>
        ${dayTasks.length === 0 ? 
          '<div class="empty-day">✨ Free day</div>' : 
          dayTasks.map(t => {
            const isFocus = focusTaskName && t.task.toLowerCase().includes(focusTaskName);
            return `
              <div class="task ${isFocus ? 'focus-task' : ''}" 
                   onclick="toggleTaskComplete(this)"
                   style="background:${t.color}33;box-shadow:inset 6px 0 0 ${t.color};padding-left:14px;">
                <input type="checkbox" class="task-checkbox" onclick="event.stopPropagation()">
                <span class="task-text">${isFocus ? '⭐ ' : ''}${t.task}</span>
              </div>
            `;
          }).join("")
        }
      </div>
    `;
  });
  
  // Render legend
  const legend = document.getElementById("legend");
  legend.innerHTML = Object.entries(legendMap).map(([goal, color]) => `
    <div class="legend-item">
      <span class="legend-color" style="background:${color}"></span>
      <span class="legend-text">${goal}</span>
    </div>
  `).join("");
  
  // Generate AI suggestions
  await generateAISuggestions(table, days);
  
  weeklyPlan = { table, reward, punishment, focusTask: focusTaskName };
  saveProgress();
  next();
}

function toggleTaskComplete(taskEl) {
  taskEl.classList.toggle('completed');
  const checkbox = taskEl.querySelector('.task-checkbox');
  if (checkbox) checkbox.checked = !checkbox.checked;
}

/* ==================== AI SUGGESTIONS ==================== */
async function generateAISuggestions(table, days) {
  const suggestionEl = document.getElementById("aiSuggestion");
  const mood = document.getElementById("mood").value;
  const mainDay = document.getElementById("mainDay").value;
  
  suggestionEl.innerHTML = `
    <div class="ai-loading">
      <span class="spinner"></span>
      <p>Analyzing your schedule and generating insights...</p>
    </div>
  `;
  
  const workloadData = days.map(d => ({
    day: d,
    taskCount: table[d].length,
    tasks: table[d].map(t => t.task)
  }));
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `You are a student productivity coach. Analyze this weekly schedule and provide actionable insights.

Weekly Schedule:
${workloadData.map(d => `${d.day}: ${d.taskCount} tasks - ${d.tasks.join(', ') || 'None'}`).join('\n')}

Main Focus Day: ${mainDay}
Current Mood/Energy: ${mood}

Provide 3-5 specific, actionable suggestions to optimize this schedule. Consider:
- Workload balance across days
- Task distribution based on energy levels (${mood})
- Break recommendations
- Priority adjustments
- Time management tips

Format as bullet points, be concise and encouraging.`
        }]
      })
    });

    const data = await response.json();
    const suggestions = data.content[0].text.trim();
    
    suggestionEl.innerHTML = `
      <div class="ai-suggestions-content">
        <h4>📊 Workload Analysis</h4>
        <div class="workload-summary">
          ${workloadData.map(d => `
            <div class="workload-item ${d.taskCount === 0 ? 'empty' : d.taskCount > 3 ? 'heavy' : ''}">
              <span class="day-label">${d.day}</span>
              <span class="task-count-badge">${d.taskCount}</span>
            </div>
          `).join('')}
        </div>
        
        <h4 style="margin-top:20px">💡 AI Recommendations</h4>
        <div class="suggestions-text">
          ${suggestions.split('\n').map(line => 
            line.trim() ? `<p>${line}</p>` : ''
          ).join('')}
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('AI suggestions failed:', error);
    suggestionEl.innerHTML = `
      <div class="ai-suggestions-content">
        <h4>📊 Workload Summary</h4>
        <div class="workload-summary">
          ${workloadData.map(d => `
            <div class="workload-item ${d.taskCount === 0 ? 'empty' : d.taskCount > 3 ? 'heavy' : ''}">
              <span class="day-label">${d.day}</span>
              <span class="task-count-badge">${d.taskCount}</span>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:15px;opacity:0.8">
          💡 Balance your tasks across the week. Heavy days (${workloadData.filter(d => d.taskCount > 3).map(d => d.day).join(', ') || 'none'}) might need breaks or task redistribution.
        </p>
      </div>
    `;
  }
}

/* ==================== DATA PERSISTENCE ==================== */
function saveProgress() {
  if (!currentUser) return;
  
  const planData = {
    goals,
    allTasks,
    mainDay: document.getElementById("mainDay")?.value,
    reward: document.getElementById("reward")?.value,
    punishment: document.getElementById("punishment")?.value,
    mood: document.getElementById("mood")?.value,
    focusTask: document.getElementById("focusTask")?.value,
    lastSaved: new Date().toISOString()
  };
  
  localStorage.setItem(`plan_${currentUser.pin}`, JSON.stringify(planData));
}

function loadSavedPlan() {
  if (!currentUser) return;
  
  const saved = localStorage.getItem(`plan_${currentUser.pin}`);
  if (!saved) return;
  
  try {
    const planData = JSON.parse(saved);
    goals = planData.goals || [];
    allTasks = planData.allTasks || [];
    
    if (planData.mainDay) document.getElementById("mainDay").value = planData.mainDay;
    if (planData.reward) document.getElementById("reward").value = planData.reward;
    if (planData.punishment) document.getElementById("punishment").value = planData.punishment;
    if (planData.mood) document.getElementById("mood").value = planData.mood;
    if (planData.focusTask) document.getElementById("focusTask").value = planData.focusTask;
    
    showNotification("Previous plan loaded!", "success");
  } catch (error) {
    console.error("Failed to load plan:", error);
  }
}

/* ==================== EXPORT/IMPORT ==================== */
function exportPlan() {
  if (!currentUser) {
    showNotification("Please login first", "error");
    return;
  }
  
  const exportData = {
    user: { name: currentUser.name, intent: currentUser.intent },
    goals,
    allTasks,
    mainDay: document.getElementById("mainDay").value,
    reward: document.getElementById("reward").value,
    punishment: document.getElementById("punishment").value,
    mood: document.getElementById("mood").value,
    focusTask: document.getElementById("focusTask").value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focus-plan-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification("Plan exported successfully!", "success");
}

function importPlan(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      goals = data.goals || [];
      allTasks = data.allTasks || [];
      
      if (data.mainDay) document.getElementById("mainDay").value = data.mainDay;
      if (data.reward) document.getElementById("reward").value = data.reward;
      if (data.punishment) document.getElementById("punishment").value = data.punishment;
      if (data.mood) document.getElementById("mood").value = data.mood;
      if (data.focusTask) document.getElementById("focusTask").value = data.focusTask;
      
      renderGoals();
      saveProgress();
      showNotification("Plan imported successfully!", "success");
      
    } catch (error) {
      showNotification("Invalid file format", "error");
      console.error('Import error:', error);
    }
  };
  reader.readAsText(file);
}

function resetPlanner() {
  if (confirm("Are you sure you want to start over? This will clear all your current goals and tasks.")) {
    goals = [];
    allTasks = [];
    
    document.getElementById("goalInput").value = "";
    document.getElementById("reward").value = "";
    document.getElementById("punishment").value = "";
    document.getElementById("focusTask").value = "";
    document.getElementById("mainDay").value = "Monday";
    document.getElementById("mood").value = "normal";
    
    slide = 1;
    renderGoals();
    updateUI();
    showNotification("Planner reset. Starting fresh!", "info");
  }
}

function printPlan() {
  window.print();
}

/* ==================== EVENT LISTENERS ==================== */
document.getElementById("newUserBtn").addEventListener("click", showNewUser);
document.getElementById("existingUserBtn").addEventListener("click", showExistingUser);
document.getElementById("createBtn").addEventListener("click", registerUser);
document.getElementById("loginBtn").addEventListener("click", loginUser);
document.getElementById("backToAuth1").addEventListener("click", backToAuth);
document.getElementById("backToAuth2").addEventListener("click", backToAuth);
document.getElementById("logoutBtn").addEventListener("click", logout);

document.getElementById("addGoalBtn").addEventListener("click", addGoal);
document.getElementById("goalInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addGoal();
});

document.getElementById("next1").addEventListener("click", next);
document.getElementById("back1").addEventListener("click", back);
document.getElementById("next2").addEventListener("click", next);
document.getElementById("back2").addEventListener("click", back);
document.getElementById("next3").addEventListener("click", prepareBatch);
document.getElementById("back3").addEventListener("click", back);
document.getElementById("next4").addEventListener("click", next);
document.getElementById("back4").addEventListener("click", back);
document.getElementById("generateBtn").addEventListener("click", generate);

document.getElementById("exportBtn").addEventListener("click", exportPlan);
document.getElementById("importBtn").addEventListener("click", () => {
  document.getElementById("importFile").click();
});
document.getElementById("importFile").addEventListener("change", importPlan);
document.getElementById("printBtn").addEventListener("click", printPlan);
document.getElementById("resetBtn").addEventListener("click", resetPlanner);

function renderTasks(goals){
  const tasksArea = document.getElementById("tasksArea");
  tasksArea.innerHTML = "";

  goals.forEach(goal => {
    const box = document.createElement("div");
    box.className = "goal-task-box";

    box.innerHTML = `
      <h3>${goal.name}</h3>

      <button class="ai-generate-btn">✨ Generate Tasks with AI</button>

      <div class="ai-status" style="display:none"></div>

      <textarea class="taskInput"
        placeholder="Add tasks manually (one per line)"></textarea>

      <div class="task-tips">
        💡 Tip: Be specific (e.g., “Solve 20 numericals” not just “Physics”)
      </div>
    `;

    const btn = box.querySelector(".ai-generate-btn");
    const textarea = box.querySelector(".taskInput");
    const status = box.querySelector(".ai-status");

    btn.addEventListener("click", () => {
      generateAITasks(goal.name, textarea, status);
    });

    tasksArea.appendChild(box);
  });
}
async function generateAITasks(goalName, textarea, statusBox) {
  statusBox.style.display = "block";
  statusBox.className = "ai-status ai-loading";
  statusBox.innerHTML = "⏳ Generating tasks with AI...";

  try {
    const response = await fetch("YOUR_API_URL_HERE", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        goal: goalName
      })
    });

    const data = await response.json();

    // assume API returns array of tasks
    const tasks = data.tasks || [];

    textarea.value = tasks.join("\n");

    statusBox.className = "ai-status ai-success";
    statusBox.innerHTML = "✅ Tasks generated successfully!";
  } catch (error) {
    statusBox.className = "ai-status ai-error";
    statusBox.innerHTML = "❌ Failed to generate tasks";
    console.error(error);
  }
}
/* ==================== INITIALIZATION ==================== */
updateUI();

});

/* ==================== GLOBAL STATE ==================== */
let slide = 0;
const slides = document.querySelectorAll(".slide");
const bar = document.getElementById("bar");

let currentUser = null;
let goals = [];
let allTasks = [];
let weeklyPlan = null;
let taskCompletionData = {
  completed: [],
  history: {}
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/* ==================== UI NAVIGATION ==================== */
function updateUI() {
  slides.forEach((s, i) => s.classList.toggle("active", i === slide));
  const progress = slide === 0 ? 0 : (slide / (slides.length - 1)) * 100;
  bar.style.width = progress + "%";

  if (currentUser && slide > 0) {
    document.getElementById("userProfile").style.display = "flex";
    document.getElementById("userNameDisplay").textContent = currentUser.username || currentUser.name;
    
    if (currentUser.avatar) {
      const avatar = document.getElementById("userAvatar");
      if (avatar) {
        avatar.src = currentUser.avatar;
        avatar.style.display = "block";
      }
    }
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
function showNotification(message, type = "info") {
  const container = document.getElementById("notificationContainer");
  const div = document.createElement("div");
  div.className = `notification notification-${type}`;
  
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  div.innerHTML = `
    <span class="notification-icon">${icon}</span>
    <span class="notification-text">${message}</span>
  `;
  
  container.appendChild(div);
  
  setTimeout(() => {
    div.classList.add("fade-out");
    setTimeout(() => div.remove(), 300);
  }, 3000);
}

/* ==================== AUTH SYSTEM ==================== */
document.getElementById("newUserBtn").addEventListener("click", function() {
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("newUserForm").style.display = "block";
});

document.getElementById("existingUserBtn").addEventListener("click", function() {
  const users = JSON.parse(localStorage.getItem("focusUsers") || "{}");
  
  if (Object.keys(users).length === 0) {
    showNotification("No users found. Please create a new account.", "error");
    return;
  }
  
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("existingUserForm").style.display = "block";
  
  const userList = Object.keys(users).map(u => users[u].name).join(", ");
  document.getElementById("userGreeting").innerHTML = `
    <p class="greeting-text">Welcome back! 👋</p>
    <p class="intention-text">Registered users: ${userList}</p>
  `;
});

document.getElementById("backToAuth1").addEventListener("click", resetAuth);
document.getElementById("backToAuth2").addEventListener("click", resetAuth);

function resetAuth() {
  document.getElementById("authButtons").style.display = "flex";
  document.getElementById("newUserForm").style.display = "none";
  document.getElementById("existingUserForm").style.display = "none";
}

document.getElementById("createBtn").addEventListener("click", function() {
  const name = document.getElementById("userName").value.trim();
  const username = document.getElementById("userUsername").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const intent = document.getElementById("userIntent").value.trim();
  const pin = document.getElementById("userPin").value.trim();

  if (!name || !username || !intent || !/^\d{4}$/.test(pin)) {
    showNotification("Please fill all required fields correctly", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem("focusUsers") || "{}");
  
  if (users[username]) {
    showNotification("Username already exists", "error");
    return;
  }

  const user = {
    name,
    username,
    email,
    intent,
    pin,
    avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2338bdf8'/%3E%3Ctext x='50' y='65' font-size='40' text-anchor='middle' fill='white' font-family='Arial'%3E" + name.charAt(0).toUpperCase() + "%3C/text%3E%3C/svg%3E",
    createdAt: new Date().toISOString()
  };
  
  users[username] = user;
  localStorage.setItem("focusUsers", JSON.stringify(users));
  localStorage.setItem("lastUser", username);
  
  currentUser = user;
  showNotification("Account created successfully! 🎉", "success");
  
  slide = 1;
  updateUI();
});

document.getElementById("loginBtn").addEventListener("click", function() {
  const username = document.getElementById("loginUsername").value.trim();
  const pin = document.getElementById("loginPin").value.trim();
  
  const users = JSON.parse(localStorage.getItem("focusUsers") || "{}");
  const user = users[username];
  
  if (!user || user.pin !== pin) {
    showNotification("Invalid username or PIN", "error");
    return;
  }

  currentUser = user;
  localStorage.setItem("lastUser", username);
  loadSavedPlan();
  
  showNotification(`Welcome back, ${user.name}! 👋`, "success");
  
  slide = 1;
  updateUI();
});

// Auto-login last user
window.addEventListener("load", function() {
  const lastUser = localStorage.getItem("lastUser");
  if (lastUser) {
    const users = JSON.parse(localStorage.getItem("focusUsers") || "{}");
    if (users[lastUser]) {
      showNotification("Click 'Existing User' to continue", "info");
    }
  }
});

/* ==================== PROFILE MANAGEMENT ==================== */
const profileBtn = document.getElementById("profileBtn");
if (profileBtn) {
  profileBtn.addEventListener("click", function() {
    const modal = document.getElementById("profileModal");
    if (modal) {
      modal.style.display = "flex";
      
      document.getElementById("profileName").value = currentUser.name || "";
      document.getElementById("profileUsername").value = currentUser.username || "";
      document.getElementById("profileEmail").value = currentUser.email || "";
      document.getElementById("profileIntent").value = currentUser.intent || "";
      
      const profileAvatar = document.getElementById("profileAvatar");
      if (profileAvatar && currentUser.avatar) {
        profileAvatar.src = currentUser.avatar;
      }
    }
  });
}

const closeProfileModal = document.getElementById("closeProfileModal");
if (closeProfileModal) {
  closeProfileModal.addEventListener("click", function() {
    document.getElementById("profileModal").style.display = "none";
  });
}

const uploadAvatarBtn = document.getElementById("uploadAvatarBtn");
if (uploadAvatarBtn) {
  uploadAvatarBtn.addEventListener("click", function() {
    document.getElementById("avatarUpload").click();
  });
}

const avatarUpload = document.getElementById("avatarUpload");
if (avatarUpload) {
  avatarUpload.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const avatarData = event.target.result;
        document.getElementById("profileAvatar").src = avatarData;
        currentUser.avatar = avatarData;
      };
      reader.readAsDataURL(file);
    }
  });
}

const saveProfileBtn = document.getElementById("saveProfileBtn");
if (saveProfileBtn) {
  saveProfileBtn.addEventListener("click", function() {
    const name = document.getElementById("profileName").value.trim();
    const username = document.getElementById("profileUsername").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const intent = document.getElementById("profileIntent").value.trim();
    const newPin = document.getElementById("profilePin").value.trim();

    if (!name || !username || !intent) {
      showNotification("Please fill required fields", "error");
      return;
    }

    const users = JSON.parse(localStorage.getItem("focusUsers") || "{}");
    const oldUsername = currentUser.username;
    
    if (username !== oldUsername && users[username]) {
      showNotification("Username already taken", "error");
      return;
    }

    currentUser.name = name;
    currentUser.email = email;
    currentUser.intent = intent;
    
    if (newPin && /^\d{4}$/.test(newPin)) {
      currentUser.pin = newPin;
    }
    
    if (username !== oldUsername) {
      delete users[oldUsername];
      currentUser.username = username;
      localStorage.setItem("lastUser", username);
    }
    
    users[username] = currentUser;
    localStorage.setItem("focusUsers", JSON.stringify(users));
    
    showNotification("Profile updated successfully! ✅", "success");
    document.getElementById("profileModal").style.display = "none";
    document.getElementById("userNameDisplay").textContent = username;
    
    if (currentUser.avatar) {
      const avatar = document.getElementById("userAvatar");
      if (avatar) {
        avatar.src = currentUser.avatar;
      }
    }
  });
}

/* ==================== ANALYTICS ==================== */
const analyticsBtn = document.getElementById("analyticsBtn");
if (analyticsBtn) {
  analyticsBtn.addEventListener("click", function() {
    const modal = document.getElementById("analyticsModal");
    if (modal) {
      modal.style.display = "flex";
      updateAnalytics();
    }
  });
}

const closeAnalyticsModal = document.getElementById("closeAnalyticsModal");
if (closeAnalyticsModal) {
  closeAnalyticsModal.addEventListener("click", function() {
    document.getElementById("analyticsModal").style.display = "none";
  });
}

function updateAnalytics() {
  if (!currentUser || !weeklyPlan) {
    showNotification("Please create a plan first", "info");
    return;
  }

  const savedData = localStorage.getItem(`analytics_${currentUser.username}`);
  if (savedData) {
    taskCompletionData = JSON.parse(savedData);
  }

  const totalTasks = allTasks.length;
  const completedTasks = taskCompletionData.completed.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const streak = calculateStreak();

  document.getElementById("completedTasks").textContent = completedTasks;
  document.getElementById("totalTasks").textContent = totalTasks;
  document.getElementById("completionRate").textContent = completionRate + "%";
  document.getElementById("streak").textContent = streak;

  renderGoalsBreakdown();
  renderWeeklyActivity();
}

function calculateStreak() {
  const history = taskCompletionData.history;
  const dates = Object.keys(history).sort().reverse();
  
  let streak = 0;
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  for (let date of dates) {
    const checkDate = new Date(date);
    if (checkDate.toDateString() === yesterday.toDateString() || 
        checkDate.toDateString() === new Date().toDateString()) {
      if (history[date] > 0) {
        streak++;
        yesterday.setDate(yesterday.getDate() - 1);
      } else {
        break;
      }
    }
  }
  
  return streak;
}

function renderGoalsBreakdown() {
  const container = document.getElementById("goalsBreakdown");
  
  if (!goals.length) {
    container.innerHTML = "<p style='text-align:center;color:var(--text-secondary)'>No goals yet</p>";
    return;
  }

  container.innerHTML = goals.map(goal => {
    const goalTasks = allTasks.filter(t => t.goalId === goal.id);
    const completed = goalTasks.filter(t => taskCompletionData.completed.includes(t.id)).length;
    const total = goalTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return `
      <div class="goal-progress-item" style="border-color: ${goal.color}">
        <div class="goal-progress-header">
          <span class="goal-progress-name" style="color: ${goal.color}">${goal.name}</span>
          <span class="goal-progress-stats">${completed}/${total} tasks</span>
        </div>
        <div class="goal-progress-bar">
          <div class="goal-progress-fill" style="width: ${percentage}%; background: ${goal.color}"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderWeeklyActivity() {
  const container = document.getElementById("weeklyActivity");
  
  container.innerHTML = days.map(day => {
    const dayTasks = allTasks.filter(t => t.days && t.days.includes(day));
    const completed = dayTasks.filter(t => taskCompletionData.completed.includes(t.id)).length;
    
    return `
      <div class="activity-day">
        <div class="activity-day-name">${day}</div>
        <div class="activity-day-count">${completed}</div>
        <div class="activity-day-label">completed</div>
      </div>
    `;
  }).join("");
}

/* ==================== GOALS ==================== */
const goalInput = document.getElementById("goalInput");
const goalColor = document.getElementById("goalColor");
const goalsDiv = document.getElementById("goals");

document.getElementById("addGoalBtn").addEventListener("click", addGoal);

goalInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") addGoal();
});

function addGoal() {
  if (!goalInput.value.trim()) {
    showNotification("Please enter a goal name", "error");
    return;
  }
  
  goals.push({
    id: Date.now(),
    name: goalInput.value.trim(),
    color: goalColor.value
  });
  
  goalInput.value = "";
  goalColor.value = getRandomColor();
  renderGoals();
  showNotification("Goal added! 🎯", "success");
}

function getRandomColor() {
  const colors = ["#4CAF50", "#2196F3", "#9C27B0", "#FF5722", "#FFC107", "#00BCD4", "#E91E63", "#8BC34A"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function renderGoals() {
  if (goals.length === 0) {
    goalsDiv.innerHTML = `
      <div class="empty-state">
        <p>📝 No goals yet. Add your first goal to get started!</p>
      </div>
    `;
    return;
  }

  goalsDiv.innerHTML = goals.map((g, i) => `
    <div class="goal-box">
      <div class="goal-header">
        <span class="goal-name" style="color: ${g.color}">${g.name}</span>
        <span class="color-indicator" style="background: ${g.color}"></span>
      </div>
      <div class="color-bar" style="background: ${g.color}"></div>
      <span class="delete" onclick="removeGoal(${i})">×</span>
    </div>
  `).join("");
}

window.removeGoal = function(index) {
  if (confirm("Delete this goal?")) {
    goals.splice(index, 1);
    renderGoals();
    showNotification("Goal removed", "info");
  }
}

/* ==================== TASKS AREA (IMPORTANT) ==================== */
function renderTasksArea() {
  const tasksArea = document.getElementById("tasksArea");

  tasksArea.innerHTML = goals.map((goal, index) => `
    <div class="goal-task-box">
      <h3 style="color:${goal.color}">${goal.name}</h3>

      <button id="aiBtn${index}" onclick="generateTasksWithAI(${index})">
        ✨ Generate Tasks with AI
      </button>

      <div id="aiStatus${index}"></div>
      <div id="aiTasks${index}"></div>

      <textarea id="tasks${index}" rows="5"
        placeholder="Add tasks manually (one per line)"></textarea>
    </div>
  `).join("");
}

/* ==================== AI TASK GENERATION ==================== */
window.generateTasksWithAI = function(index) {
  const goal = goals[index];
  const status = document.getElementById(`aiStatus${index}`);
  const list = document.getElementById(`aiTasks${index}`);
  const btn = document.getElementById(`aiBtn${index}`);

  btn.disabled = true;
  status.innerHTML = "🤖 Thinking...";

  setTimeout(() => {
    const tasks = generateSmartTasks(goal.name);
    list.innerHTML = tasks.map((t, i) => `
      <div onclick="addAITaskToManual(${index}, '${t.replace(/'/g,"\\'")}', ${i})">
        ➕ ${t}
      </div>
    `).join("");
    status.innerHTML = "✅ Tasks ready";
    btn.disabled = false;
  }, 1000);
};

function generateSmartTasks(goal) {
  const g = goal.toLowerCase();
  if (g.includes("dsa")) {
    return [
      "Study arrays for 30 mins",
      "Solve 5 array problems",
      "Learn linked lists for 30 mins",
      "Solve 3 linked list problems",
      "Review mistakes"
    ];
  }
  return [
    `Understand basics of ${goal}`,
    `Practice related problems`,
    `Revise notes`,
    `Work on challenging task`,
    `Plan next steps`
  ];
}

window.addAITaskToManual = function(index, task) {
  const t = document.getElementById(`tasks${index}`);
  t.value += (t.value ? "\n" : "") + task;
  showNotification("Task added", "success");
};

/* ==================== BATCHING ==================== */
function renderBatching() {
  const batchArea = document.getElementById("batchArea");
  
  allTasks = [];
  goals.forEach((goal, index) => {
    const textarea = document.getElementById(`tasks${index}`);
    if (textarea && textarea.value.trim()) {
      const taskLines = textarea.value.trim().split("\n").filter(t => t.trim());
      taskLines.forEach(taskText => {
        allTasks.push({
          id: Date.now() + Math.random(),
          text: taskText.trim(),
          goalId: goal.id,
          goalName: goal.name,
          color: goal.color,
          days: []
        });
      });
    }
  });

  if (allTasks.length === 0) {
    batchArea.innerHTML = `
      <div class="empty-state">
        <p>📋 No tasks found. Go back and add tasks to your goals.</p>
      </div>
    `;
    return;
  }

  batchArea.innerHTML = allTasks.map((task, index) => `
    <div class="task-batch-box">
      <div class="task-header">
        <div class="task-name">${task.text}</div>
      </div>
      <div class="task-meta">
        <span class="goal-badge" style="background: ${task.color}; color: #000">${task.goalName}</span>
      </div>
      <div class="days-selector">
        <label class="days-label">Select Days:</label>
        <div class="days-grid">
          ${days.map(day => `
            <label class="day-checkbox">
              <input type="checkbox" onchange="toggleTaskDay(${index}, '${day}')" id="task${index}${day}">
              <span class="day-label">${day}</span>
            </label>
          `).join("")}
        </div>
      </div>
    </div>
  `).join("");
}

window.toggleTaskDay = function(taskIndex, day) {
  const task = allTasks[taskIndex];
  const dayIdx = task.days.indexOf(day);
  
  if (dayIdx > -1) {
    task.days.splice(dayIdx, 1);
  } else {
    task.days.push(day);
  }
}

/* ==================== TIMETABLE GENERATION ==================== */
function generatePlan() {
  const focusTask = document.getElementById("focusTask").value.trim();
  const reward = document.getElementById("reward").value.trim();
  const punishment = document.getElementById("punishment").value.trim();
  const mood = document.getElementById("mood").value;
  const mainDay = document.getElementById("mainDay").value;

  if (!reward || !punishment) {
    showNotification("Please set both reward and punishment", "error");
    return;
  }

  weeklyPlan = {
    focusTask,
    reward,
    punishment,
    mood,
    mainDay,
    tasks: allTasks,
    goals: goals
  };

  renderTimetable();
  generateAISuggestions();
  
  saveProgress();
  next();
}

function renderTimetable() {
  const table = document.getElementById("table");
  const legend = document.getElementById("legend");
  
  document.getElementById("rewardDisplay").textContent = weeklyPlan.reward;
  document.getElementById("punishmentDisplay").textContent = weeklyPlan.punishment;

  table.innerHTML = days.map(day => {
    const dayTasks = allTasks.filter(t => t.days.includes(day));
    
    return `
      <div class="day-column">
        <div class="day-header">
          <h4>${day}</h4>
          <span class="task-count">${dayTasks.length} tasks</span>
        </div>
        ${dayTasks.length === 0 ? 
          '<div class="empty-day">✨ Free day</div>' :
          dayTasks.map(task => {
            const isFocus = weeklyPlan.focusTask && task.text.toLowerCase().includes(weeklyPlan.focusTask.toLowerCase());
            return `
              <div class="task ${isFocus ? 'focus-task' : ''}" 
                   style="background: ${task.color}; border: 1px solid ${task.color}"
                   onclick="toggleTaskCompletion('${task.id}', this)">
                <input type="checkbox" class="task-checkbox" onclick="event.stopPropagation()">
                <span class="task-text">${task.text}</span>
              </div>
            `;
          }).join("")
        }
      </div>
    `;
  }).join("");

  legend.innerHTML = goals.map(goal => `
    <div class="legend-item">
      <div class="legend-color" style="background: ${goal.color}"></div>
      <span class="legend-text">${goal.name}</span>
    </div>
  `).join("");
}

window.toggleTaskCompletion = function(taskId, element) {
  const checkbox = element.querySelector(".task-checkbox");
  checkbox.checked = !checkbox.checked;
  
  element.classList.toggle("completed");
  
  if (checkbox.checked) {
    if (!taskCompletionData.completed.includes(taskId)) {
      taskCompletionData.completed.push(taskId);
    }
    
    const today = new Date().toISOString().split('T')[0];
    taskCompletionData.history[today] = (taskCompletionData.history[today] || 0) + 1;
    
    showNotification("Task completed! 🎉", "success");
  } else {
    const idx = taskCompletionData.completed.indexOf(taskId);
    if (idx > -1) {
      taskCompletionData.completed.splice(idx, 1);
    }
  }
  
  if (currentUser) {
    localStorage.setItem(`analytics_${currentUser.username}`, JSON.stringify(taskCompletionData));
  }
}

function generateAISuggestions() {
  const suggestionEl = document.getElementById("aiSuggestion");
  
  const workloadByDay = days.map(day => ({
    day,
    count: allTasks.filter(t => t.days.includes(day)).length
  }));
  
  const maxLoad = Math.max(...workloadByDay.map(w => w.count));
  const avgLoad = workloadByDay.reduce((sum, w) => sum + w.count, 0) / 7;
  
  let suggestions = [];
  
  if (maxLoad > avgLoad * 1.5) {
    const heavyDays = workloadByDay.filter(w => w.count > avgLoad * 1.5).map(w => w.day);
    suggestions.push(`⚠️ Your ${heavyDays.join(", ")} ${heavyDays.length > 1 ? 'are' : 'is'} overloaded. Consider redistributing tasks.`);
  } else {
    suggestions.push("✅ Your workload is well balanced across the week.");
  }
  
  const emptyDays = workloadByDay.filter(w => w.count === 0).map(w => w.day);
  if (emptyDays.length > 0) {
    suggestions.push(`📅 You have ${emptyDays.length} free day(s): ${emptyDays.join(", ")}. Great for rest or catch-up!`);
  }
  
  if (weeklyPlan.mood === "stressed") {
    suggestions.push("🧘 Since you're feeling stressed, start each day with your easiest task to build momentum.");
  } else if (weeklyPlan.mood === "energized") {
    suggestions.push("⚡ You're energized! Tackle your hardest tasks in the morning when your energy is highest.");
  }
  
  const focusDayTasks = allTasks.filter(t => t.days.includes(weeklyPlan.mainDay.substring(0, 3)));
  if (focusDayTasks.length < 3) {
    suggestions.push(`💡 Consider adding more tasks to your focus day (${weeklyPlan.mainDay}) to maximize productivity.`);
  }
  
  suggestionEl.innerHTML = `
    <div class="ai-suggestions-content">
      <h4>📊 Workload Summary</h4>
      <div class="workload-summary">
        ${workloadByDay.map(w => `
          <div class="workload-item ${w.count === 0 ? 'empty' : w.count > avgLoad * 1.5 ? 'heavy' : ''}">
            <span class="day-label">${w.day}</span>
            <span class="task-count-badge">${w.count}</span>
          </div>
        `).join("")}
      </div>
      <div class="suggestions-text">
        ${suggestions.map(s => `<p>${s}</p>`).join("")}
      </div>
    </div>
  `;
}

/* ==================== DATA PERSISTENCE ==================== */
function saveProgress() {
  if (!currentUser) return;
  
  localStorage.setItem(`plan_${currentUser.username}`, JSON.stringify({
    goals,
    allTasks,
    weeklyPlan,
    slide
  }));
}

function loadSavedPlan() {
  const saved = localStorage.getItem(`plan_${currentUser.username}`);
  if (!saved) return;
  
  const data = JSON.parse(saved);
  goals = data.goals || [];
  allTasks = data.allTasks || [];
  weeklyPlan = data.weeklyPlan;
  
  const analyticsData = localStorage.getItem(`analytics_${currentUser.username}`);
  if (analyticsData) {
    taskCompletionData = JSON.parse(analyticsData);
  }
  
  if (data.slide) {
    slide = data.slide;
  }
}

/* ==================== EXPORT/IMPORT ==================== */
document.getElementById("exportBtn").addEventListener("click", function() {
  const dataStr = JSON.stringify({
    user: currentUser.name,
    goals,
    tasks: allTasks,
    plan: weeklyPlan
  }, null, 2);
  
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `focus-plan-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  showNotification("Plan exported! 📥", "success");
});

document.getElementById("importBtn").addEventListener("click", function() {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);
      goals = data.goals || [];
      allTasks = data.tasks || [];
      weeklyPlan = data.plan;
      
      saveProgress();
      showNotification("Plan imported! 📤", "success");
      
      if (slide === 2) renderGoals();
      if (slide === 3) renderTasksArea();
      if (slide === 4) renderBatching();
      if (slide === 6) renderTimetable();
    } catch (err) {
      showNotification("Invalid file format", "error");
    }
  };
  reader.readAsText(file);
});

document.getElementById("printBtn").addEventListener("click", function() {
  window.print();
});

document.getElementById("resetBtn").addEventListener("click", function() {
  if (!confirm("⚠️ Are you sure you want to start over? This will clear all your current progress.")) {
    return;
  }
  
  goals = [];
  allTasks = [];
  weeklyPlan = null;
  
  if (currentUser) {
    localStorage.removeItem(`plan_${currentUser.username}`);
  }
  
  slide = 1;
  updateUI();
  showNotification("Reset complete. Starting fresh! 🔄", "info");
});

document.getElementById("logoutBtn").addEventListener("click", function() {
  if (confirm("Are you sure you want to logout?")) {
    saveProgress();
    currentUser = null;
    slide = 0;
    updateUI();
    showNotification("Logged out successfully", "info");
    resetAuth();
  }
});

/* ==================== NAVIGATION HANDLERS ==================== */
document.getElementById("next1").addEventListener("click", next);

document.getElementById("next2").addEventListener("click", function() {
  if (goals.length === 0) {
    showNotification("Please add at least one goal", "error");
    return;
  }
  renderTasksArea();
  next();
});

document.getElementById("next3").addEventListener("click", function() {
  let hasAnyTasks = false;
  goals.forEach((goal, index) => {
    const textarea = document.getElementById(`tasks${index}`);
    if (textarea && textarea.value.trim()) {
      hasAnyTasks = true;
    }
  });
  
  if (!hasAnyTasks) {
    showNotification("Please add tasks to at least one goal", "error");
    return;
  }
  
  renderBatching();
  next();
});

document.getElementById("next4").addEventListener("click", function() {
  const tasksWithDays = allTasks.filter(t => t.days.length > 0);
  if (tasksWithDays.length === 0) {
    showNotification("Please schedule at least one task", "error");
    return;
  }
  next();
});

document.getElementById("back1").addEventListener("click", back);
document.getElementById("back2").addEventListener("click", back);
document.getElementById("back3").addEventListener("click", back);
document.getElementById("back4").addEventListener("click", back);

document.getElementById("generateBtn").addEventListener("click", generatePlan);

/* ==================== INITIALIZE ==================== */
updateUI();
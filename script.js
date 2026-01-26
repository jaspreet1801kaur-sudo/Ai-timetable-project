document.addEventListener("DOMContentLoaded", function () {

let slide = 0;
const slides = document.querySelectorAll(".slide");
const bar = document.getElementById("bar");

// Data
let goals = [];
let allTasks = [];

/* ---------------- SLIDER ---------------- */
function updateUI(){
  slides.forEach((s,i)=>s.classList.toggle("active", i===slide));
  bar.style.width = slide === 0 ? "0%" : ((slide)/(slides.length-1))*100 + "%";
}

function next(){ if(slide<slides.length-1){ slide++; updateUI(); } }
function back(){ if(slide>0){ slide--; updateUI(); } }

/* ---------------- AUTH ---------------- */
function showNewUser(){
  document.getElementById("authButtons").style.display="none";
  document.getElementById("newUserForm").style.display="block";
}
function showExistingUser(){
  document.getElementById("authButtons").style.display="none";
  document.getElementById("existingUserForm").style.display="block";
}
function registerUser(){
  const name = document.getElementById("userName").value.trim();
  const intent = document.getElementById("userIntent").value.trim();
  const pin = document.getElementById("userPin").value.trim();
  if(!name||!intent||pin.length!==4){ alert("Please fill all fields correctly"); return; }
  localStorage.setItem("focusUser", JSON.stringify({name,intent,pin}));
  slide = 1; updateUI();
}
function loginUser(){
  const saved = JSON.parse(localStorage.getItem("focusUser"));
  if(!saved){ alert("No user found."); return; }
  const pin = document.getElementById("loginPin").value.trim();
  if(pin !== saved.pin){ alert("Incorrect PIN"); return; }
  slide = 1; updateUI();
}

/* ---------------- GOALS ---------------- */
function addGoal(){
  const input = document.getElementById("goalInput");
  const color = document.getElementById("goalColor").value;
  if(!input.value.trim()) return;
  goals.push({name:input.value.trim(),color});
  input.value="";
  renderGoals();
}

function deleteGoal(i){ goals.splice(i,1); renderGoals(); }

function renderGoals(){
  document.getElementById("goals").innerHTML = goals.map((g,i)=>`
    <div class="goal-box">
      <strong>${g.name}</strong>
      <div class="color-bar" style="background:${g.color}"></div>
      <span class="delete" onclick="deleteGoal(${i})">✕</span>
    </div>
  `).join("");

  document.getElementById("tasksArea").innerHTML = goals.map((g,i)=>`
    <div class="goal-box">
      <strong>${g.name}</strong>
      <div class="color-bar" style="background:${g.color}"></div>
      <textarea id="tasks${i}" placeholder="• Task1\n• Task2\n• Task3"></textarea>
    </div>
  `).join("");
}

/* ---------------- TASK BATCHING ---------------- */
function prepareBatch(){
  allTasks=[];
  const batch = document.getElementById("batchArea");
  batch.innerHTML="";
  goals.forEach((goal,i)=>{
    const lines = document.getElementById("tasks"+i).value.split("\n").filter(x=>x.trim());
    lines.forEach(task=>{
      const id = allTasks.length;
      allTasks.push({task, goal:goal.name, color:goal.color, deleted:false});
      batch.innerHTML += `
        <div class="task-box" id="task${id}">
          <strong>${task}</strong>
          <span class="delete" onclick="deleteTask(${id})">✕</span>
          <div class="color-bar" id="bar${id}" style="background:${goal.color}"></div>
          <input type="color" id="color${id}" value="${goal.color}" onchange="updateColor(${id})">
          <div class="days">
            ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`
              <label class="day"><input type="checkbox" id="${id}${d}"> ${d}</label>
            `).join("")}
          </div>
        </div>`;
    });
  });
  next();
}

function updateColor(id){
  const color = document.getElementById("color"+id).value;
  document.getElementById("bar"+id).style.background=color;
  allTasks[id].color=color;
}

function deleteTask(id){
  allTasks[id].deleted=true;
  document.getElementById("task"+id).remove();
}

/* ---------------- GENERATE TIMETABLE ---------------- */
function generate(){
  const days=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const table={}, legendMap={};
  days.forEach(d=>table[d]=[]);
  allTasks.forEach((t,i)=>{
    if(t.deleted) return;
    if(!legendMap[t.goal]) legendMap[t.goal]=t.color;
    days.forEach(d=>{
      const box=document.getElementById(i+d);
      if(box && box.checked) table[d].push(t);
    });
  });

  // Render timetable
  const grid = document.getElementById("table");
  grid.innerHTML="";
  days.forEach(d=>{
    grid.innerHTML += `
      <div class="day-column">
        <h4>${d}</h4>
        ${table[d].map(t=>`
          <div class="task" style="background:${t.color}33;box-shadow: inset 6px 0 0 ${t.color};padding-left:14px;">
            ${t.task}
          </div>
        `).join("")}
      </div>`;
  });

  // Render legend
  const legend = document.getElementById("legend");
  legend.innerHTML = Object.entries(legendMap).map(([goal,color])=>`
    <div class="legend-item">
      <span class="legend-color" style="background:${color}"></span>
      ${goal}
    </div>
  `).join("");

  next();
}

/* ---------------- ATTACH EVENTS ---------------- */
document.getElementById("newUserBtn").addEventListener("click", showNewUser);
document.getElementById("existingUserBtn").addEventListener("click", showExistingUser);
document.getElementById("createBtn").addEventListener("click", registerUser);
document.getElementById("loginBtn").addEventListener("click", loginUser);
document.getElementById("addGoalBtn").addEventListener("click", addGoal);
document.getElementById("next1").addEventListener("click", next);
document.getElementById("back1").addEventListener("click", back);
document.getElementById("next2").addEventListener("click", next);
document.getElementById("back2").addEventListener("click", back);
document.getElementById("next3").addEventListener("click", prepareBatch);
document.getElementById("back3").addEventListener("click", back);
document.getElementById("next4").addEventListener("click", next);
document.getElementById("back4").addEventListener("click", back);
document.getElementById("generateBtn").addEventListener("click", generate);

// Init
updateUI();

});
 

# ✨ AI Weekly Focus Planner - Student Edition

> A comprehensive, AI-powered weekly task planning system designed specifically for students to organize goals, generate tasks intelligently, and optimize their study schedule with smart insights.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Overview

The **AI Weekly Focus Planner** is a next-generation productivity tool built for students who want to:

- 📊 **Plan smarter** with AI-generated task breakdowns
- 🎨 **Organize visually** with color-coded goals and tasks
- 🤖 **Get insights** from AI analysis of workload and schedule
- ✅ **Track progress** with interactive task completion
- 💾 **Save & share** plans with export/import functionality

---

## ✨ Key Features

### 🔐 **User Authentication System**
- Secure PIN-based login
- Personal workspace for each user
- Auto-save functionality
- Session persistence

### 🎯 **Smart Goal Management**
- Add unlimited weekly goals
- Color-code each goal for visual clarity
- Goal templates and suggestions
- Priority-based organization

### 🤖 **AI-Powered Task Generation**
- **One-click AI task breakdown** - Transform goals into actionable tasks
- Uses Claude Sonnet 4 for intelligent task suggestions
- Considers student workload and time management
- Generates 5-7 specific, realistic tasks per goal

### 📅 **Intelligent Task Scheduling**
- Assign tasks to multiple days
- Visual day-by-day timetable
- Highlight focus tasks for the week
- Color-coded task organization
- Task completion tracking with checkboxes

### 🧠 **AI Insights & Analytics**
- **Workload analysis** across the week
- **Smart suggestions** based on your mood and energy
- **Balance recommendations** for heavy/light days
- **Break scheduling** tips
- **Priority optimization** advice

### 💾 **Data Management**
- Export plans as JSON files
- Import saved plans
- Auto-save to browser storage
- Print-friendly format
- Easy plan sharing

### 🎁 **Motivation System**
- Set rewards for task completion
- Define consequences for incomplete tasks
- Mood tracking integration
- Energy level assessment

---

## 🚀 Quick Start

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for AI features)
- No installation required!

### Setup (3 Easy Steps)

1. **Clone the repository**
```bash
git clone https://github.com/ritikchaudharyy/weekly-task-based-project.git
cd weekly-task-based-project
```

2. **Open the application**
```bash
# Simply open index.html in your browser
# Or use a local server (recommended):
python -m http.server 8000
# Then visit: http://localhost:8000
```

3. **Start planning!**
- Create your account (name + intention + 4-digit PIN)
- Add your weekly goals
- Let AI generate tasks or add manually
- Schedule tasks across the week
- Get AI insights and start achieving!

---

## 📖 How to Use

### Step-by-Step Guide

#### **Step 1: Authentication**
- **New User**: Enter your name, intention, and create a 4-digit PIN
- **Existing User**: Log in with your PIN to restore previous plans

#### **Step 2: Set Main Focus Day**
Choose the day when you have the most time and energy (e.g., Saturday for deep work)

#### **Step 3: Add Goals**
- Enter goal name (e.g., "Master Physics Chapter 5")
- Pick a color for visual identification
- Add multiple goals for the week

#### **Step 4: Generate Tasks**
For each goal, either:
- **Click "Generate with AI"** for automatic task breakdown
- **Type manually** - add tasks line by line

**Example AI-Generated Tasks:**
```
Goal: "Master Physics Chapter 5"

AI generates:
• Study Newton's Laws concepts for 1 hour
• Complete 15 practice problems on motion
• Create summary notes with diagrams (45 mins)
• Watch video lectures on force applications (30 mins)
• Review chapter with flashcards (30 mins)
• Take practice quiz and review mistakes
```

#### **Step 5: Schedule Tasks**
- Assign colors to each task
- Select which days you'll work on each task
- Mark your main focus task (gets special highlighting)

#### **Step 6: Set Motivation**
- **Reward**: What you get for completing everything
- **Punishment**: Consequence for incomplete tasks
- **Mood**: How you usually feel while working

#### **Step 7: View Your Plan**
- See visual weekly calendar
- Click tasks to mark as complete
- Read AI suggestions for optimization
- Export, print, or share your plan

---

## 🏗️ Architecture

### Project Structure
```
weekly-task-based-project/
│
├── index.html          # Main application structure
├── script.js           # Core logic, AI integration, data management
├── style.css           # Complete styling with responsive design
└── README.md           # This file
```

### Technology Stack

**Frontend:**
- HTML5 (Semantic structure)
- CSS3 (Modern styling, animations, responsive design)
- Vanilla JavaScript ES6+ (No frameworks!)

**AI Integration:**
- Anthropic Claude API (Sonnet 4)
- Real-time task generation
- Workload analysis

**Data Storage:**
- LocalStorage (browser-based)
- JSON export/import
- Session persistence

### Key Components

**1. Authentication Module**
```javascript
registerUser()     // Create new account
loginUser()        // Login existing user
logout()           // Secure logout
```

**2. Goal Management**
```javascript
addGoal()          // Add new goal
deleteGoal(i)      // Remove goal
renderGoals()      // Update UI
```

**3. AI Task Generator**
```javascript
generateTasksWithAI(index)  // AI-powered task breakdown
```

**4. Task Scheduler**
```javascript
prepareBatch()     // Prepare tasks for scheduling
updateColor(id)    // Customize task colors
generate()         // Create final timetable
```

**5. AI Insights Engine**
```javascript
generateAISuggestions()  // Analyze workload & provide tips
```

**6. Data Persistence**
```javascript
saveProgress()     // Auto-save current state
exportPlan()       // Download as JSON
importPlan()       // Upload saved plan
```

---

## 🎨 Design Philosophy

### User Experience Principles
1. **Simplicity First** - Clean, intuitive interface
2. **Visual Clarity** - Color-coding and clear hierarchy
3. **Progressive Disclosure** - Step-by-step wizard flow
4. **Instant Feedback** - Notifications for every action
5. **Mobile-First** - Responsive on all devices

### Visual Design
- **Dark Theme** - Reduces eye strain during long planning sessions
- **Glassmorphism** - Modern, depth-based UI elements
- **Smooth Animations** - Professional transitions
- **Color Psychology** - Purposeful use of colors for clarity

---

## 🔧 Advanced Features

### AI Capabilities

**Task Generation Algorithm:**
```
User Input: "Learn Java Programming"
    ↓
AI Processing:
- Analyzes goal complexity
- Considers student schedule
- Breaks into micro-tasks
- Assigns realistic durations
    ↓
Output:
• Study Java basics for 1 hour
• Complete 10 coding exercises
• Build simple calculator project
• Review OOP concepts (30 mins)
• Take practice quiz on arrays
```

**Workload Analysis:**
- Calculates tasks per day
- Identifies overloaded days
- Suggests redistribution
- Recommends break times

**Smart Suggestions:**
- Based on mood state
- Considering energy levels
- Task priority reordering
- Time optimization tips

### Data Export Format
```json
{
  "user": {
    "name": "Student Name",
    "intent": "Excel in academics"
  },
  "goals": [
    {
      "id": 1738012345678,
      "name": "Master Physics",
      "color": "#4CAF50"
    }
  ],
  "allTasks": [...],
  "mainDay": "Saturday",
  "reward": "Movie night",
  "punishment": "No social media for 2 days",
  "mood": "energized",
  "focusTask": "Daily revision",
  "exportDate": "2025-01-27T..."
}
```

---

## 📊 Use Cases

### For Students
- **Exam Preparation**: Break down syllabus into daily tasks
- **Project Management**: Organize major assignments
- **Skill Development**: Plan learning new technologies
- **Habit Building**: Track daily study routines

### Example Weekly Plan
```
Goal 1: Ace Math Midterm (Blue)
├─ Mon: Review chapters 1-3 (1 hour)
├─ Wed: Complete practice problems
├─ Fri: Take mock test
└─ Sun: Review mistakes

Goal 2: Complete CS Project (Green)
├─ Tue: Write project outline
├─ Thu: Code main features
└─ Sat: Test and debug

Goal 3: Fitness (Orange)
├─ Mon-Sun: 30 min morning workout
```

---

## 🚧 Known Limitations

1. **No Cloud Sync** - Plans are stored locally (use export/import)
2. **Single User per Browser** - One active user at a time
3. **No Mobile App** - Web-only interface (but mobile responsive)
4. **AI API Dependency** - Requires internet for AI features
5. **Limited Analytics** - Basic workload tracking only

---

## 🔮 Roadmap

### Version 2.1 (Next Release)
- [ ] Cloud synchronization
- [ ] Multi-user collaboration
- [ ] Advanced analytics dashboard
- [ ] Calendar integration (Google Calendar)
- [ ] Email reminders

### Version 2.5
- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Pomodoro timer integration
- [ ] Study statistics and reports
- [ ] Gamification (points, streaks, badges)

### Version 3.0
- [ ] Team planning features
- [ ] Teacher/parent oversight mode
- [ ] Integration with LMS platforms
- [ ] AI study session planning
- [ ] Voice input support

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute
1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas
3. **Improve Documentation** - Fix typos, add examples
4. **Code Contributions** - Submit pull requests

### Development Setup
```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/weekly-task-based-project.git

# 3. Create a feature branch
git checkout -b feature/amazing-feature

# 4. Make your changes
# 5. Test thoroughly
# 6. Commit with clear message
git commit -m "Add amazing feature"

# 7. Push to your fork
git push origin feature/amazing-feature

# 8. Open a Pull Request
```

### Code Style Guidelines
- Use clear, descriptive variable names
- Comment complex logic
- Follow existing code structure
- Test on multiple browsers
- Ensure mobile responsiveness

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Ritik Chaudhary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👥 Credits

**Creator & Lead Developer**
- **Ritik Chaudhary** - [@ritikchaudharyy](https://github.com/ritikchaudharyy)

**Forked From**
- Original concept by [@kunalchauhan471](https://github.com/kunalchauhan471)

**Special Thanks**
- [Anthropic](https://www.anthropic.com/) for Claude AI API
- All contributors and beta testers
- Student community for feedback

---

## 📧 Contact & Support

### Get Help
- **Issues**: [GitHub Issues](https://github.com/ritikchaudharyy/weekly-task-based-project/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ritikchaudharyy/weekly-task-based-project/discussions)
- **Email**: Create an issue for contact

### Follow Development
- ⭐ Star this repo to show support
- 👁️ Watch for updates
- 🍴 Fork to customize

---

## 🎓 Learning Resources

Want to understand how this works?

**For Beginners:**
- [HTML Basics](https://developer.mozilla.org/en-US/docs/Learn/HTML)
- [CSS Fundamentals](https://developer.mozilla.org/en-US/docs/Learn/CSS)
- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Learn/JavaScript)

**For Advanced:**
- [Claude AI API Docs](https://docs.anthropic.com/)
- [Responsive Design](https://web.dev/responsive-web-design-basics/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 📈 Project Statistics

- **Lines of Code**: ~2000+
- **Functions**: 30+
- **AI Features**: 2 (Task Generation, Insights)
- **Supported Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Support**: ✅ Fully Responsive

---

## 💡 Pro Tips

1. **Use AI Generation** - Save hours of planning time
2. **Color Code Wisely** - Use distinct colors for different subjects
3. **Set Realistic Tasks** - Break large tasks into 30min-2hour chunks
4. **Export Weekly** - Backup your plans regularly
5. **Review AI Suggestions** - They adapt to your workload patterns
6. **Mark Focus Tasks** - Highlight your top priority
7. **Track Progress** - Check off completed tasks daily
8. **Adjust on the Go** - Plans are flexible, modify as needed

---

## 🌟 Success Stories

> *"This planner helped me organize my semester finals. The AI task breakdown saved me hours!"*
> - Student, Computer Science

> *"Love the visual timetable and color coding. Makes planning actually enjoyable!"*
> - Student, Engineering

---

## 🙏 Acknowledgments

Built with:
- ❤️ Passion for productivity
- 🧠 AI-powered intelligence
- 🎨 Modern design principles
- 📚 Student feedback

---

**⭐ If this project helps you, please give it a star!**

**Made with ❤️ for students, by students**

---

*Last Updated: January 27, 2025*

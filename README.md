# 🎓 Student Task Tracker

A clean, modern, and lightweight web application built for students to organize, track, and manage their daily study tasks and assignments.

This project is specifically structured to be simple and beginner-friendly—ideal for learning and practicing **Git** and **GitHub** workflows.

---

## ✨ Features

- **Add New Tasks**: Quickly enter any assignment or study goal with instant validation.
- **Task List**: Clean, card-based display of all added tasks.
- **Mark Complete / Incomplete**: Interactive custom checkbox with animated checkmark and strikethrough styling.
- **Delete Tasks**: Remove tasks easily with smooth exit transitions.
- **Real-Time Statistics**: Tracks **Total Tasks**, **Completed Tasks**, and **Pending Tasks** with a visual progress bar.
- **Filter Views**: Toggle between **All**, **Pending**, and **Completed** tasks, plus a quick **Clear Completed** action.
- **Local Persistence**: Automatically saves your tasks in your browser's `localStorage` so data is preserved across page refreshes.
- **Responsive & Accessible**: Optimized for laptops, tablets, and smartphones with full keyboard accessibility.

---

## 📁 Project Structure

```text
git demo 2/
├── index.html     # Semantic HTML5 layout and accessibility markup
├── style.css      # Modern design system, responsive styles, animations
├── app.js         # Vanilla JavaScript logic, state management, localStorage
└── README.md      # Project documentation & Git practice guide
```

---

## 🚀 How to Run Locally

Because this project uses pure HTML, CSS, and Vanilla JavaScript with no dependencies or build steps, you can run it in multiple easy ways:

### Option 1: Direct File Open
Simply double-click [`index.html`](./index.html) or open it in your web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Using VS Code Live Server
1. Install the **Live Server** extension in VS Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.

### Option 3: Python Built-in HTTP Server
Run the following command in your terminal:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## 🛠️ Git & GitHub Practice Guide

Use this repository to practice essential Git commands:

### 1. Initialize Git Repository
```bash
git init
```

### 2. Check Repository Status
```bash
git status
```

### 3. Stage Files
```bash
# Stage all files
git add .

# Or stage a specific file
git add index.html
```

### 4. Commit Changes
```bash
git commit -m "feat: initial commit with Student Task Tracker app"
```

### 5. Create and Switch Branches
```bash
# Create a new feature branch
git checkout -b feature/new-style

# Switch back to main
git checkout main
```

### 6. Link to GitHub and Push
```bash
# Rename default branch to main (if needed)
git branch -M main

# Add your GitHub repository remote URL
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push changes to GitHub
git push -u origin main
```

---

## 📄 License
Open source and free to use for learning and educational purposes.

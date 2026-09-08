/**
 * Student Task Tracker - Core Application Logic
 * Clean, lightweight Vanilla JavaScript for managing tasks, statistics, and persistence.
 */

// ==========================================
// 1. Initial State & Storage Keys
// ==========================================
const STORAGE_KEY = 'student_task_tracker_data';

// Default tasks for first-time visitors
const DEFAULT_TASKS = [
  { id: '1', text: 'Review Math notes for upcoming quiz', completed: false, createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Submit Computer Science lab assignment', completed: true, createdAt: Date.now() - 7200000 },
  { id: '3', text: 'Read Chapter 4 of Biology textbook', completed: false, createdAt: Date.now() - 1800000 }
];

let tasks = [];
let currentFilter = 'all'; // 'all' | 'pending' | 'completed'

// ==========================================
// 2. DOM Elements
// ==========================================
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const formError = document.getElementById('formError');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptyDesc = document.getElementById('emptyDesc');

// Stats Elements
const totalTasksCount = document.getElementById('totalTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');
const progressPercent = document.getElementById('progressPercent');
const progressBarFill = document.getElementById('progressBarFill');
const progressBarTrack = document.getElementById('progressBarTrack');

// Filter & Action Buttons
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// User Profile Elements
const userProfileBar = document.getElementById('userProfileBar');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userBadge = document.getElementById('userBadge');
const logoutBtn = document.getElementById('logoutBtn');

// ==========================================
// 3. Storage Functions
// ==========================================
function getStorageKey() {
  if (window.StudentAuth && typeof window.StudentAuth.getUserTasksStorageKey === 'function') {
    return window.StudentAuth.getUserTasksStorageKey();
  }
  return STORAGE_KEY;
}

function loadTasks() {
  try {
    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      tasks = JSON.parse(saved);
    } else {
      // Load initial default student tasks for demonstration
      tasks = [...DEFAULT_TASKS];
      saveTasks();
    }
  } catch (e) {
    console.error('Failed to load tasks from localStorage:', e);
    tasks = [...DEFAULT_TASKS];
  }
}

function saveTasks() {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage:', e);
  }
}

// ==========================================
// 4. Task Operations
// ==========================================

/**
 * Adds a new task to the task list
 * @param {string} text - Task description
 */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showError('Please enter a task before clicking Add Task.');
    return;
  }

  const newTask = {
    id: Date.now().toString(),
    text: trimmed,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  clearError();
  render();
}

/**
 * Toggles completion status of a task
 * @param {string} id - Task ID
 */
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  render();
}

/**
 * Deletes a task by ID with a smooth exit animation
 * @param {string} id - Task ID
 * @param {HTMLElement} itemElement - DOM element of the task
 */
function deleteTask(id, itemElement) {
  if (itemElement) {
    itemElement.classList.add('removing');
    // Wait for the CSS animation to complete before removing from state
    setTimeout(() => {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      render();
    }, 220);
  } else {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    render();
  }
}

/**
 * Clears all completed tasks
 */
function clearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) return;

  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
}

// ==========================================
// 5. UI Helper & Error Functions
// ==========================================
function showError(message) {
  formError.textContent = message;
  taskInput.classList.add('input-error');
}

function clearError() {
  formError.textContent = '';
  taskInput.classList.remove('input-error');
}

/**
 * Updates task statistics and progress bar
 */
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  totalTasksCount.textContent = total;
  completedTasksCount.textContent = completed;
  pendingTasksCount.textContent = pending;

  progressPercent.textContent = `${percentage}%`;
  progressBarFill.style.width = `${percentage}%`;
  progressBarTrack.setAttribute('aria-valuenow', percentage);

  // Show or hide clear completed button
  clearCompletedBtn.style.display = completed > 0 ? 'inline-block' : 'none';
}

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// 6. Render Function
// ==========================================
function render() {
  updateStats();

  // Filter tasks
  let filteredTasks = tasks;
  if (currentFilter === 'pending') {
    filteredTasks = tasks.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  }

  // Handle Empty State
  if (filteredTasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.style.display = 'flex';

    if (tasks.length === 0) {
      emptyTitle.textContent = 'No tasks yet!';
      emptyDesc.textContent = 'Add your first study task above to get started.';
    } else if (currentFilter === 'pending') {
      emptyTitle.textContent = 'All caught up!';
      emptyDesc.textContent = 'Great job! You have no pending study tasks.';
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptyDesc.textContent = 'Check off tasks as you finish them to track your progress.';
    }
    return;
  }

  emptyState.style.display = 'none';

  // Render task items
  taskList.innerHTML = filteredTasks.map(task => {
    return `
      <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-content" onclick="window.handleToggleTask('${task.id}')">
          <label class="custom-checkbox" onclick="event.stopPropagation()">
            <input 
              type="checkbox" 
              ${task.completed ? 'checked' : ''} 
              onchange="window.handleToggleTask('${task.id}')"
              aria-label="Mark task '${escapeHTML(task.text)}' as ${task.completed ? 'incomplete' : 'complete'}"
            >
            <span class="checkbox-visual">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </label>
          <span class="task-text">${escapeHTML(task.text)}</span>
        </div>
        <button 
          type="button" 
          class="delete-btn" 
          onclick="window.handleDeleteTask('${task.id}', this)"
          title="Delete task"
          aria-label="Delete task '${escapeHTML(task.text)}'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </li>
    `;
  }).join('');
}

// Global handlers exposed for inline element events
window.handleToggleTask = function(id) {
  toggleTask(id);
};

window.handleDeleteTask = function(id, buttonEl) {
  const itemElement = buttonEl.closest('.task-item');
  deleteTask(id, itemElement);
};

// ==========================================
// 7. Event Listeners
// ==========================================

// Form Submit Handler
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = taskInput.value;
  addTask(val);
  taskInput.value = '';
  taskInput.focus();
});

// Clear input error on typing
taskInput.addEventListener('input', () => {
  if (formError.textContent) {
    clearError();
  }
});

// Filter Tabs Click Handlers
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    currentFilter = btn.getAttribute('data-filter');
    render();
  });
});

// Clear Completed Button Click Handler
clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

// ==========================================
// 8. Initialization & Session Guard
// ==========================================
function initUserProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const isGuest = urlParams.get('guest') === 'true';

  let currentUser = window.StudentAuth ? window.StudentAuth.getCurrentUser() : null;

  // Route guard: if not authenticated and not explicitly in guest mode, redirect to login
  if (!currentUser && !isGuest) {
    window.location.href = 'login.html';
    return false;
  }

  if (currentUser) {
    if (userAvatar) {
      userAvatar.textContent = currentUser.initials || 'ST';
      userAvatar.style.backgroundColor = currentUser.avatarColor || '#4f46e5';
    }
    if (userName) userName.textContent = currentUser.name;
    if (userBadge) userBadge.textContent = currentUser.major || 'Student';
    if (logoutBtn) {
      logoutBtn.title = `Signed in as ${currentUser.email}. Click to sign out.`;
      logoutBtn.addEventListener('click', () => {
        window.StudentAuth.logout();
      });
    }
  } else if (isGuest) {
    if (userAvatar) {
      userAvatar.textContent = 'GS';
      userAvatar.style.backgroundColor = '#64748b';
    }
    if (userName) userName.textContent = 'Guest Student';
    if (userBadge) userBadge.textContent = 'Preview Mode';
    if (logoutBtn) {
      logoutBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
          <polyline points="10 17 15 12 10 7"/>
          <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
        <span>Sign In</span>
      `;
      logoutBtn.title = 'Sign in to an account';
      logoutBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  }
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const allowRender = initUserProfile();
  if (allowRender) {
    loadTasks();
    render();
  }
});

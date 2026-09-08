/**
 * Student Task Tracker - Authentication Module
 * Manages user accounts, persistent sessions, demo profiles, and per-student data scoping.
 */

(function () {
  const SESSION_KEY = 'student_tracker_auth_user';
  const USERS_KEY = 'student_tracker_users';

  // Default demo student accounts
  const DEFAULT_USERS = [
    {
      id: 'usr_alex',
      name: 'Alex Chen',
      email: 'alex@student.edu',
      password: 'password123',
      major: 'Computer Science',
      year: 'Junior',
      avatarColor: '#4f46e5',
      initials: 'AC',
      joinedAt: Date.now() - 86400000 * 30
    },
    {
      id: 'usr_sarah',
      name: 'Sarah Miller',
      email: 'sarah@student.edu',
      password: 'password123',
      major: 'Pre-Med Biology',
      year: 'Sophomore',
      avatarColor: '#059669',
      initials: 'SM',
      joinedAt: Date.now() - 86400000 * 15
    }
  ];

  // Default tasks seeded for each demo user
  const SEED_TASKS = {
    'usr_alex': [
      { id: 't_a1', text: 'Complete Data Structures & Algorithms Assignment 3', completed: false, createdAt: Date.now() - 7200000 },
      { id: 't_a2', text: 'Prepare slides for Software Engineering sprint review', completed: true, createdAt: Date.now() - 14400000 },
      { id: 't_a3', text: 'Read chapters 5 & 6 in Operating Systems text', completed: false, createdAt: Date.now() - 21600000 }
    ],
    'usr_sarah': [
      { id: 't_s1', text: 'Memorize Organic Chemistry reaction mechanisms', completed: false, createdAt: Date.now() - 3600000 },
      { id: 't_s2', text: 'Submit Genetics lab write-up before midnight', completed: false, createdAt: Date.now() - 10800000 },
      { id: 't_s3', text: 'Review Cellular Respiration flashcards', completed: true, createdAt: Date.now() - 25000000 }
    ]
  };

  /**
   * Helper to get users list from localStorage
   */
  function getUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading users from storage:', e);
    }
    // Initialize with default users
    saveUsers(DEFAULT_USERS);
    // Seed their demo tasks if not present
    seedDemoTasks();
    return DEFAULT_USERS;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to storage:', e);
    }
  }

  function seedDemoTasks() {
    for (const [userId, tasks] of Object.entries(SEED_TASKS)) {
      const taskKey = `student_task_tracker_data_${userId}`;
      if (!localStorage.getItem(taskKey)) {
        localStorage.setItem(taskKey, JSON.stringify(tasks));
      }
    }
  }

  /**
   * Generate initials from full name
   */
  function getInitials(name) {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /**
   * Auth API object
   */
  window.StudentAuth = {
    DEFAULT_USERS,

    /**
     * Get currently authenticated user
     * @returns {Object|null}
     */
    getCurrentUser() {
      try {
        const session = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
      } catch (e) {
        console.error('Error reading auth session:', e);
        return null;
      }
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
      return Boolean(this.getCurrentUser());
    },

    /**
     * Authenticate with email & password
     */
    login(email, password, remember = true) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();

      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return { success: false, error: 'No student account found with this email address.' };
      }

      if (user.password !== cleanPassword) {
        return { success: false, error: 'Incorrect password. Please check and try again.' };
      }

      // Successful login
      const sessionUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        major: user.major,
        year: user.year || 'Student',
        avatarColor: user.avatarColor,
        initials: user.initials || getInitials(user.name),
        loginTime: Date.now()
      };

      const storage = remember ? localStorage : sessionStorage;
      // Clear the other to prevent stale sessions
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      storage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

      return { success: true, user: sessionUser };
    },

    /**
     * Sign up a new student account
     */
    signup(name, email, major, password) {
      const cleanName = (name || '').trim();
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanMajor = (major || '').trim() || 'General Studies';
      const cleanPassword = (password || '').trim();

      if (!cleanName || cleanName.length < 2) {
        return { success: false, error: 'Please enter your full student name.' };
      }
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Please provide a valid student email address.' };
      }
      if (!cleanPassword || cleanPassword.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const users = getUsers();
      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      // Random friendly accent colors for student avatar
      const colors = ['#4f46e5', '#7c3aed', '#059669', '#0284c7', '#d97706', '#dc2626'];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];

      const newUser = {
        id: 'usr_' + Date.now().toString(36),
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        major: cleanMajor,
        year: 'Student',
        avatarColor,
        initials: getInitials(cleanName),
        joinedAt: Date.now()
      };

      users.push(newUser);
      saveUsers(users);

      // Initialize welcome tasks for new student
      const userTaskKey = `student_task_tracker_data_${newUser.id}`;
      const welcomeTasks = [
        { id: 'welcome_1', text: `Welcome to Student Task Tracker, ${cleanName.split(' ')[0]}!`, completed: false, createdAt: Date.now() },
        { id: 'welcome_2', text: `Add your course assignments for ${cleanMajor}`, completed: false, createdAt: Date.now() }
      ];
      localStorage.setItem(userTaskKey, JSON.stringify(welcomeTasks));

      // Automatically sign in the new student
      return this.login(cleanEmail, cleanPassword, true);
    },

    /**
     * Quick 1-click Demo Login
     */
    loginAsDemo(demoId) {
      const users = getUsers();
      const demoUser = users.find(u => u.id === demoId) || DEFAULT_USERS.find(u => u.id === demoId);
      if (demoUser) {
        return this.login(demoUser.email, demoUser.password, true);
      }
      return { success: false, error: 'Demo profile not found.' };
    },

    /**
     * Log out current user
     */
    logout() {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = 'login.html';
    },

    /**
     * Protect page route - redirects to login if unauthenticated
     */
    requireAuth(redirectUrl = 'login.html') {
      const user = this.getCurrentUser();
      if (!user) {
        window.location.href = redirectUrl;
        return null;
      }
      return user;
    },

    /**
     * If user is already logged in on login page, redirect to app
     */
    redirectIfAuthenticated(dashboardUrl = 'index.html') {
      if (this.isAuthenticated()) {
        window.location.href = dashboardUrl;
      }
    },

    /**
     * Get storage key for current user's tasks
     */
    getUserTasksStorageKey() {
      const user = this.getCurrentUser();
      if (user && user.id) {
        return `student_task_tracker_data_${user.id}`;
      }
      return 'student_task_tracker_data'; // Fallback
    }
  };

  // Pre-seed storage immediately on script load
  getUsers();
})();

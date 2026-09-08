/**
 * Student Task Tracker - Login Page Logic (login.js)
 * Implements form validation, mode switching, password visibility, and demo logins.
 */

document.addEventListener('DOMContentLoaded', () => {
  // If user is already logged in, redirect straight to dashboard (unless ?logout=true)
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.has('logout')) {
    window.StudentAuth.redirectIfAuthenticated('index.html');
  }

  // DOM Elements
  const authCard = document.getElementById('authCard');
  const authForm = document.getElementById('authForm');
  const authHeading = document.getElementById('authHeading');
  const authSubheading = document.getElementById('authSubheading');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const nameGroup = document.getElementById('nameGroup');
  const majorGroup = document.getElementById('majorGroup');
  const studentNameInput = document.getElementById('studentName');
  const studentMajorInput = document.getElementById('studentMajor');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('current-password');
  const passwordLabel = document.getElementById('passwordLabel');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon = document.getElementById('eyeIcon');
  const eyeOffIcon = document.getElementById('eyeOffIcon');
  const rememberMe = document.getElementById('rememberMe');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const authAlert = document.getElementById('authAlert');
  const alertMessage = document.getElementById('alertMessage');
  const demoAlexBtn = document.getElementById('demoAlexBtn');
  const demoSarahBtn = document.getElementById('demoSarahBtn');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const forgotModal = document.getElementById('forgotModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  let currentMode = 'signin'; // 'signin' | 'signup'

  // ==========================================
  // 1. Tab Switching (Sign In <-> Sign Up)
  // ==========================================
  function setMode(mode) {
    currentMode = mode;
    clearAlert();

    if (mode === 'signin') {
      tabSignIn.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.classList.remove('active');
      tabSignUp.setAttribute('aria-selected', 'false');

      authHeading.textContent = 'Welcome Back';
      authSubheading.textContent = 'Sign in to manage your student assignments and study goals.';
      submitBtnText.textContent = 'Sign In';

      nameGroup.style.display = 'none';
      majorGroup.style.display = 'none';
      studentNameInput.removeAttribute('required');

      passwordLabel.textContent = 'Password';
      passwordInput.setAttribute('autocomplete', 'current-password');
      emailInput.focus();
    } else {
      tabSignUp.classList.add('active');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.classList.remove('active');
      tabSignIn.setAttribute('aria-selected', 'false');

      authHeading.textContent = 'Create Student Account';
      authSubheading.textContent = 'Join and start tracking your coursework and study milestones.';
      submitBtnText.textContent = 'Create Account';

      nameGroup.style.display = 'flex';
      majorGroup.style.display = 'flex';
      studentNameInput.setAttribute('required', 'true');

      passwordLabel.textContent = 'Create Password (min. 6 characters)';
      passwordInput.setAttribute('autocomplete', 'new-password');
      studentNameInput.focus();
    }
  }

  tabSignIn.addEventListener('click', () => setMode('signin'));
  tabSignUp.addEventListener('click', () => setMode('signup'));

  // ==========================================
  // 2. Password Visibility Toggle
  // ==========================================
  let isPasswordVisible = false;

  togglePasswordBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    if (isPasswordVisible) {
      passwordInput.type = 'text';
      eyeIcon.style.display = 'none';
      eyeOffIcon.style.display = 'block';
      togglePasswordBtn.setAttribute('aria-label', 'Hide password');
      togglePasswordBtn.setAttribute('aria-pressed', 'true');
    } else {
      passwordInput.type = 'password';
      eyeIcon.style.display = 'block';
      eyeOffIcon.style.display = 'none';
      togglePasswordBtn.setAttribute('aria-label', 'Show password as plain text');
      togglePasswordBtn.setAttribute('aria-pressed', 'false');
    }
  });

  // ==========================================
  // 3. Alerts & Feedback
  // ==========================================
  function showAlert(message, type = 'error') {
    alertMessage.textContent = message;
    authAlert.className = `auth-alert ${type}`;
    authAlert.style.display = 'flex';

    // Trigger subtle shake effect on error
    if (type === 'error') {
      authCard.classList.remove('shake');
      void authCard.offsetWidth; // Force DOM reflow
      authCard.classList.add('shake');
    }
  }

  function clearAlert() {
    authAlert.style.display = 'none';
    authAlert.className = 'auth-alert';
    alertMessage.textContent = '';
  }

  // Clear alert upon user typing
  [emailInput, passwordInput, studentNameInput, studentMajorInput].forEach(input => {
    if (input) {
      input.addEventListener('input', clearAlert);
    }
  });

  // ==========================================
  // 4. Form Submission (Sign In & Sign Up)
  // ==========================================
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = rememberMe.checked;

    if (!email) {
      showAlert('Please enter your student email address.');
      emailInput.focus();
      return;
    }

    if (!password) {
      showAlert('Please enter your account password.');
      passwordInput.focus();
      return;
    }

    // Set loading button state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      if (currentMode === 'signin') {
        const result = window.StudentAuth.login(email, password, remember);
        if (result.success) {
          showAlert(`Welcome back, ${result.user.name}! Redirecting...`, 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 500);
        } else {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          showAlert(result.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        // Sign Up Mode
        const name = studentNameInput.value.trim();
        const major = studentMajorInput.value.trim();

        if (!name) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          showAlert('Please enter your full name.');
          studentNameInput.focus();
          return;
        }

        const result = window.StudentAuth.signup(name, email, major, password);
        if (result.success) {
          showAlert(`Account created successfully! Welcome, ${result.user.name}! Redirecting...`, 'success');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 600);
        } else {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          showAlert(result.error || 'Failed to create account.');
        }
      }
    }, 350);
  });

  // ==========================================
  // 5. 1-Click Demo Logins
  // ==========================================
  function handleDemoLogin(userId, buttonEl) {
    clearAlert();
    buttonEl.style.transform = 'scale(0.97)';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      const res = window.StudentAuth.loginAsDemo(userId);
      if (res.success) {
        showAlert(`Signed in as demo student ${res.user.name}. Redirecting...`, 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        buttonEl.style.transform = '';
        showAlert(res.error || 'Could not load demo student profile.');
      }
    }, 300);
  }

  demoAlexBtn.addEventListener('click', () => handleDemoLogin('usr_alex', demoAlexBtn));
  demoSarahBtn.addEventListener('click', () => handleDemoLogin('usr_sarah', demoSarahBtn));

  // ==========================================
  // 6. Forgot Password Helper Modal
  // ==========================================
  forgotPasswordBtn.addEventListener('click', () => {
    forgotModal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    forgotModal.classList.remove('active');
  });

  forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
      forgotModal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forgotModal.classList.contains('active')) {
      forgotModal.classList.remove('active');
    }
  });
});

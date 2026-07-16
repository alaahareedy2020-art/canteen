import { loginUser } from '../services/db.js';
import { updateNavbar } from '../app.js';

export function renderLogin() {
  return `
    <div class="auth-section">
      <div class="auth-card">
        <!-- Logo -->
        <div class="logo-container auth-logo">
          <div class="logo-symbol">
            <span class="logo-symbol-text">Z</span>
          </div>
          <div class="logo-text-group">
            <span class="logo-text">Gen<span class="red-z">Z</span>Coders</span>
            <span class="logo-subtitle">ELSEWEDY ELECTOMETER</span>
          </div>
        </div>

        <h2 class="auth-title">Welcome Back</h2>
        <p class="auth-subtitle">Log in to order your school lunch</p>

        <!-- Status Alerts -->
        <div class="auth-alert success-alert" id="login-success-alert" style="display: none;"></div>
        <div class="auth-alert error-alert" id="login-error-alert" style="display: none;"></div>

        <!-- Login Form -->
        <form class="auth-form" id="login-form" novalidate>
          <!-- Email -->
          <div class="form-group">
            <label for="login-email"><i class="fa-solid fa-envelope"></i> Email Address</label>
            <input type="email" id="login-email" placeholder="example@school.com" required>
          </div>
          
          <!-- Password -->
          <div class="form-group" style="margin-bottom: var(--spacing-lg);">
            <label for="login-password"><i class="fa-solid fa-lock"></i> Password</label>
            <input type="password" id="login-password" placeholder="Enter password" required>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary auth-submit-btn" id="login-submit-btn">
            Log In <i class="fa-solid fa-right-to-bracket"></i>
          </button>
        </form>

        <p class="auth-redirect">
          New student? <a href="#/register">Create an account</a>
        </p>
      </div>
    </div>
  `;
}

export function initLogin() {
  const form = document.getElementById('login-form');
  const errorAlert = document.getElementById('login-error-alert');
  const successAlert = document.getElementById('login-success-alert');

  // Check if redirect has "?registered=true"
  const hash = window.location.hash;
  if (hash.includes('registered=true')) {
    successAlert.textContent = 'Account created successfully! Please log in below.';
    successAlert.style.display = 'block';
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorAlert.style.display = 'none';
      successAlert.style.display = 'none';

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        showError('Please enter both email and password.');
        return;
      }

      // Authenticate
      const result = await loginUser(email, password);

      if (result.success) {
        // Update navigation panel options
        updateNavbar();
        
        // Redirect directly to the student dashboard
        window.location.hash = '#/dashboard';
      } else {
        showError(result.message);
      }
    });
  }

  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    const card = document.querySelector('.auth-card');
    if (card) {
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }
}

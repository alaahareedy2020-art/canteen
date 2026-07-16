import { registerUser } from '../services/db.js';

export function renderRegister() {
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

        <h2 class="auth-title">Create Account</h2>
        <p class="auth-subtitle">Sign up to start ordering healthy meals</p>

        <!-- Status Messages -->
        <div class="auth-alert error-alert" id="register-error-alert" style="display: none;"></div>

        <!-- Registration Form -->
        <form class="auth-form" id="register-form" novalidate>
          <div class="form-row">
            <!-- Register As Role -->
            <div class="form-group" style="grid-column: span 2;">
              <label for="reg-role"><i class="fa-solid fa-user-shield"></i> Register As</label>
              <select id="reg-role" required>
                <option value="student" selected>Student / User</option>
                <option value="admin">Canteen Admin (Staff)</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <!-- Full Name -->
            <div class="form-group">
              <label for="reg-name"><i class="fa-solid fa-user"></i> Full Name</label>
              <input type="text" id="reg-name" placeholder="Enter your full name" required>
            </div>
            
            <!-- Email -->
            <div class="form-group">
              <label for="reg-email"><i class="fa-solid fa-envelope"></i> Email Address</label>
              <input type="email" id="reg-email" placeholder="example@school.com" required>
            </div>
          </div>

          <div class="form-row">
            <!-- Password -->
            <div class="form-group">
              <label for="reg-password"><i class="fa-solid fa-lock"></i> Password</label>
              <input type="password" id="reg-password" placeholder="Create password" required>
            </div>
            
            <!-- Confirm Password -->
            <div class="form-group">
              <label for="reg-confirm-password"><i class="fa-solid fa-shield-halved"></i> Confirm Password</label>
              <input type="password" id="reg-confirm-password" placeholder="Repeat password" required>
            </div>
          </div>

          <!-- Student Only Fields -->
          <div id="student-only-fields" class="form-section-animated">
            <div class="form-row-triple">
              <!-- Age -->
              <div class="form-group">
                <label for="reg-age"><i class="fa-solid fa-calendar-days"></i> Age</label>
                <input type="number" id="reg-age" placeholder="Age" min="6" max="25">
              </div>
              
              <!-- Grade -->
              <div class="form-group">
                <label for="reg-grade"><i class="fa-solid fa-graduation-cap"></i> Grade</label>
                <select id="reg-grade">
                  <option value="" disabled selected>Grade</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <!-- Class -->
              <div class="form-group">
                <label for="reg-class"><i class="fa-solid fa-school"></i> Class</label>
                <select id="reg-class">
                  <option value="" disabled selected>Class</option>
                  <option value="Class A">Class A</option>
                  <option value="Class B">Class B</option>
                  <option value="Class C">Class C</option>
                  <option value="Class D">Class D</option>
                </select>
              </div>
            </div>
            <div class="form-row" style="margin-top: 0.5rem; width: 100%;">
              <div class="form-group" style="width: 100%;">
                <label for="reg-term-grade"><i class="fa-solid fa-medal"></i> Last Term Grade / GPA Evaluation</label>
                <select id="reg-term-grade" style="width: 100%;">
                  <option value="A">A (Excellent / ممتاز)</option>
                  <option value="B" selected>B (Very Good / جيد جداً)</option>
                  <option value="C">C (Good / جيد)</option>
                  <option value="D">D (Pass / مقبول)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="btn-primary auth-submit-btn" id="reg-submit-btn">
            Create Account <i class="fa-solid fa-user-plus"></i>
          </button>
        </form>

        <p class="auth-redirect">
          Already have an account? <a href="#/login">Log in here</a>
        </p>
      </div>
    </div>
  `;
}

export function initRegister() {
  const form = document.getElementById('register-form');
  const errorAlert = document.getElementById('register-error-alert');
  const roleSelect = document.getElementById('reg-role');
  const studentFields = document.getElementById('student-only-fields');

  if (roleSelect && studentFields) {
    roleSelect.addEventListener('change', () => {
      if (roleSelect.value === 'admin') {
        studentFields.style.maxHeight = '0px';
        studentFields.style.opacity = '0';
        studentFields.style.overflow = 'hidden';
        studentFields.style.pointerEvents = 'none';
        studentFields.style.marginTop = '0';
      } else {
        studentFields.style.maxHeight = '200px';
        studentFields.style.opacity = '1';
        studentFields.style.overflow = 'visible';
        studentFields.style.pointerEvents = 'all';
        studentFields.style.marginTop = 'var(--spacing-md)';
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorAlert.style.display = 'none';

      // Gather input values
      const role = roleSelect ? roleSelect.value : 'student';
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;

      // Conditional student values
      let age = null;
      let grade = null;
      let classValue = null;
      let termGrade = null;

      if (role === 'student') {
        age = document.getElementById('reg-age').value;
        grade = document.getElementById('reg-grade').value;
        classValue = document.getElementById('reg-class').value;
        termGrade = document.getElementById('reg-term-grade').value;

        if (!age || !grade || !classValue || !termGrade) {
          showError('Please fill out student metadata (age, grade, class, term grade).');
          return;
        }

        const ageNum = parseInt(age, 10);
        if (isNaN(ageNum) || ageNum < 6 || ageNum > 25) {
          showError('Please enter a valid student age between 6 and 25.');
          return;
        }
      }

      // Basic client-side checks
      if (!name || !email || !password || !confirmPassword) {
        showError('Please fill out all mandatory fields.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError('Please enter a valid email address.');
        return;
      }

      if (password.length < 4) {
        showError('Password must be at least 4 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        showError('Passwords do not match. Please verify.');
        return;
      }

      // Register via database service
      const result = await registerUser({
        name,
        email,
        password,
        role,
        age,
        grade,
        class: classValue,
        termGrade
      });

      if (result.success) {
        // Redirect to login page on success, with a success parameter in url
        window.location.hash = '#/login?registered=true';
      } else {
        showError(result.message);
      }
    });
  }

  function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    
    // Smooth shake animation on error
    const card = document.querySelector('.auth-card');
    if (card) {
      card.classList.remove('shake');
      // trigger reflow
      void card.offsetWidth;
      card.classList.add('shake');
    }
  }
}

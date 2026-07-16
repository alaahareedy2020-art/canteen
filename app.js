import { initRouter } from './router.js';
import { getCurrentSession, clearSession } from './services/db.js';
import { fetchMeals } from './services/meals.js';

// Global application state
export const AppState = {
  cart: [],
  user: null, // Dynamic state
};

// Initialize Application UI features when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  await fetchMeals(); // Dynamically load initial meals list from SQLite DB
  initMobileMenu();
  updateNavbar();
  initTheme();
  initRouter();
  updateCartBadge();
});

/**
 * Handles the responsive hamburger menu toggle.
 */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  if (mobileMenuBtn && navMenu) {
    // Toggle mobile menu visibility
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      mobileMenuBtn.innerHTML = isOpen 
        ? '<i class="fa-solid fa-xmark"></i>' 
        : '<i class="fa-solid fa-bars"></i>';
    });

    // Auto-close menu when navigation links are clicked
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('.nav-item') || e.target.closest('.nav-btn') || e.target.closest('.logo-link')) {
        navMenu.classList.remove('open');
        mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      }
    });
  }
}

/**
 * Dynamically swaps navigation buttons based on user login state.
 */
export function updateNavbar() {
  const authGroup = document.getElementById('nav-auth-group');
  if (!authGroup) return;

  const sessionUser = getCurrentSession();
  AppState.user = sessionUser;

  const cartLink = document.getElementById('nav-link-cart');
  const ordersLink = document.getElementById('nav-link-orders');

  if (sessionUser) {
    // Authenticated state: show dashboard and logout
    authGroup.innerHTML = `
      <a href="#/dashboard" class="nav-btn login-btn" id="nav-link-dashboard">
        <i class="fa-solid fa-gauge"></i> Dashboard
      </a>
      <a href="#/" class="nav-btn register-btn highlighted-btn" id="nav-link-logout">
        <i class="fa-solid fa-right-from-bracket"></i> Logout
      </a>
    `;

    // Hide links for admins
    if (sessionUser.role === 'admin') {
      if (cartLink) cartLink.style.display = 'none';
      if (ordersLink) ordersLink.style.display = 'none';
    } else {
      if (cartLink) cartLink.style.display = '';
      if (ordersLink) ordersLink.style.display = '';
    }

    // Bind logout handler
    const logoutBtn = document.getElementById('nav-link-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        updateNavbar();
        window.location.hash = '#/';
      });
    }
  } else {
    // Unauthenticated state: show login and register
    authGroup.innerHTML = `
      <a href="#/login" class="nav-btn login-btn" id="nav-link-login">Login</a>
      <a href="#/register" class="nav-btn register-btn highlighted-btn" id="nav-link-register">Register</a>
    `;

    // Show links by default
    if (cartLink) cartLink.style.display = '';
    if (ordersLink) ordersLink.style.display = '';
  }
}

/**
 * Updates the cart item count badge in the navigation bar.
 */
export function updateCartBadge() {
  const cartBadge = document.getElementById('nav-cart-count');
  if (cartBadge) {
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    // Hide badge if empty for clean visual styling
    if (totalItems === 0) {
      cartBadge.style.display = 'none';
    } else {
      cartBadge.style.display = 'flex';
    }
  }
}

/**
 * Initializes dark mode toggle logic.
 */
function initTheme() {
  const themeBtn = document.getElementById('theme-toggle');
  if (!themeBtn) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.innerHTML = isDark 
      ? '<i class="fa-solid fa-sun"></i>' 
      : '<i class="fa-solid fa-moon"></i>';
  });
}

import { renderLanding, initLanding } from './pages/landing.js';
import { renderLogin, initLogin } from './pages/login.js';
import { renderRegister, initRegister } from './pages/register.js';
import { renderDashboard, initDashboard } from './pages/dashboard.js';
import { renderMenu, initMenu } from './pages/menu.js';
import { renderCart, initCart } from './pages/cart.js';
import { renderOrders, initOrders } from './pages/orders.js';
import { getCurrentSession } from './services/db.js';

// Define the routes mapping paths to page rendering and initialization functions.
const routes = {
  '/': { render: renderLanding, init: initLanding, protected: false },
  '/login': { render: renderLogin, init: initLogin, protected: false },
  '/register': { render: registerCheck, init: initRegister, protected: false },
  '/dashboard': { render: renderDashboard, init: initDashboard, protected: true },
  
  // Menu / Cart / Orders placeholders (protected and unprotected accordingly)
  '/menu': { render: renderMenu, init: initMenu, protected: false },
  '/cart': { render: renderCart, init: initCart, protected: true },
  '/orders': { render: renderOrders, init: initOrders, protected: true }
};

// Custom check function for register route (redirect logged-in users)
function registerCheck() {
  const session = getCurrentSession();
  if (session) {
    window.location.hash = '#/dashboard';
    return '';
  }
  return renderRegister();
}

/**
 * Initializes and manages routing for the Single Page Application.
 */
export function initRouter() {
  const appContainer = document.getElementById('app');

  async function handleRouting() {
    // Get the current hash, default to '/' if empty
    let hash = window.location.hash.slice(1) || '/';
    
    // Extract path by removing query string if any
    const queryIndex = hash.indexOf('?');
    let path = queryIndex !== -1 ? hash.substring(0, queryIndex) : hash;
    
    // Normalize path to start with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Match route or fall back to home
    const route = routes[path] || routes['/'];
    
    // Route guard checks
    const sessionUser = getCurrentSession();

    // 1. Guard protected route
    if (route.protected && !sessionUser) {
      window.location.hash = '#/login';
      return;
    }

    // 2. Guard authentication portal pages if already logged in
    if (path === '/login' && sessionUser) {
      window.location.hash = '#/dashboard';
      return;
    }
    
    // Show spinner while swapping views
    appContainer.innerHTML = `
      <div class="loader-container">
        <div class="loader"></div>
      </div>
    `;

    try {
      // Call render function
      const html = await route.render();
      
      // If redirection happened in render (e.g. registerCheck), return early
      if (html === '') return;

      appContainer.innerHTML = html;
      
      // Run page-specific javascript initialization
      if (route.init) {
        route.init();
      }

      // Sync active state in the navbar
      updateActiveNavItem(path);
      
      // Auto scroll to top
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Routing Error:', error);
      appContainer.innerHTML = `
        <div style="text-align: center; padding: var(--spacing-xxl) var(--spacing-lg);">
          <h2 class="section-title" style="color: var(--primary-red);">Oops! Content Load Error</h2>
          <p class="section-desc">${error.message}</p>
          <a href="#/" class="btn-primary" style="margin-top: var(--spacing-lg);">Go back Home</a>
        </div>
      `;
    }
  }

  /**
   * Highlights the current active navigation item based on path.
   */
  function updateActiveNavItem(path) {
    document.querySelectorAll('.nav-item').forEach(link => {
      link.classList.remove('active');
    });

    let navId = 'nav-link-home';
    if (path === '/menu') navId = 'nav-link-menu';
    else if (path === '/cart') navId = 'nav-link-cart';
    else if (path === '/orders') navId = 'nav-link-orders';
    else if (path === '/dashboard') navId = 'nav-link-home'; // Dashboard maps to home container link
    
    const activeLink = document.getElementById(navId);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  // Listen to hash changes
  window.addEventListener('hashchange', handleRouting);
  
  // Perform first routing logic
  handleRouting();
}

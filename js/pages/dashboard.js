import { getCurrentSession, clearSession } from '../services/db.js';
import { updateNavbar } from '../app.js';
import { renderAdminDashboard, initAdminDashboard } from './admin_dashboard.js';

/**
 * Renders the HTML structure for the Student Dashboard.
 */
export function renderDashboard() {
  const user = getCurrentSession();
  
  if (!user) {
    return `
      <div class="section-container" style="padding: var(--spacing-xxl) 0; text-align: center;">
        <h2 class="section-title" style="color: var(--primary-red);"><i class="fa-solid fa-triangle-exclamation"></i> Access Denied</h2>
        <p class="section-desc">Please log in to view your school canteen dashboard.</p>
        <div style="margin-top: 2rem;">
          <a href="#/login" class="btn-primary">Log In</a>
        </div>
      </div>
    `;
  }

  if (user.role === 'admin') {
    return renderAdminDashboard();
  }

  return `
    <div class="dashboard-container">
      
      <!-- Welcome Message Banner -->
      <div class="db-welcome-banner">
        <div class="db-welcome-text">
          <span class="db-greeting">Welcome Back! 👋</span>
          <h2 class="db-student-name">${user.name}</h2>
          <p class="db-email">${user.email} • Smart Card Active</p>
        </div>
        <button class="db-logout-btn" id="db-logout-btn">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>

      <!-- Dashboard Grid -->
      <div class="db-grid">
        
        <!-- Left Column: Student Info, Notifications, Quick Access -->
        <div class="db-sidebar-column" style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
          
          <!-- Student Info Card -->
          <div class="db-card profile-card">
            <h3><i class="fa-solid fa-address-card"></i> Student Information</h3>
            <hr class="db-divider">
            <div class="profile-details">
              <div class="profile-item">
                <span class="p-label"><i class="fa-solid fa-graduation-cap"></i> Grade</span>
                <span class="p-value">${user.grade}</span>
              </div>
              <div class="profile-item">
                <span class="p-label"><i class="fa-solid fa-school"></i> Class</span>
                <span class="p-value">${user.class}</span>
              </div>
              <div class="profile-item">
                <span class="p-label"><i class="fa-solid fa-calendar-day"></i> Age</span>
                <span class="p-value">${user.age} Years Old</span>
              </div>
              <div class="profile-item">
                <span class="p-label"><i class="fa-solid fa-medal"></i> Term GPA</span>
                <span class="p-value" style="font-weight: 800; color: ${user.termGrade === 'A' ? '#4CAF50' : 'inherit'};">
                  ${user.termGrade || 'B'} ${user.termGrade === 'A' ? '🏆 (Excellent)' : ''}
                </span>
              </div>
            </div>
            
            <!-- Smart Canteen Balance -->
            <div class="balance-card">
              <div class="balance-info">
                <span>Smart Card Balance</span>
                <h3>EGP 150.00</h3>
              </div>
              <button class="balance-topup-btn">Top Up</button>
            </div>
          </div>

          <!-- Quick Access Card -->
          <div class="db-card actions-card">
            <h3><i class="fa-solid fa-bolt"></i> Quick Access</h3>
            <hr class="db-divider">
            <div class="actions-grid" style="margin-bottom: 0;">
              <a href="#/menu" class="action-tile">
                <div class="action-tile-icon"><i class="fa-solid fa-utensils"></i></div>
                <h4>Browse Menu</h4>
                <p>Order fresh meals</p>
              </a>
              <a href="#/cart" class="action-tile">
                <div class="action-tile-icon"><i class="fa-solid fa-cart-shopping"></i></div>
                <h4>View Cart</h4>
                <p>Checkout food</p>
              </a>
              <a href="#/orders" class="action-tile" style="grid-column: span 2;">
                <div class="action-tile-icon" style="color: var(--accent-green);"><i class="fa-solid fa-clock-rotate-left"></i></div>
                <h4>Track Live Orders</h4>
                <p>Check status at canteen counter</p>
              </a>
            </div>
          </div>

          <!-- Notifications Card -->
          <div class="db-card notifications-card">
            <h3><i class="fa-solid fa-bell"></i> Notifications</h3>
            <hr class="db-divider">
            <div class="notifications-list">
              <!-- Ready alert -->
              <div class="notification-item success">
                <div class="notification-icon-container"><i class="fa-solid fa-circle-check"></i></div>
                <div class="notification-text-container">
                  <h5>Order Ready!</h5>
                  <p>Pick up your warm lunch at Counter 2 right away.</p>
                </div>
                <button class="notification-dismiss-btn" aria-label="Dismiss Notification">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <!-- Warning alert -->
              <div class="notification-item warning">
                <div class="notification-icon-container"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="notification-text-container">
                  <h5>Low Smart Balance Warning</h5>
                  <p>Your current card balance is EGP 150.00. Recharge soon to avoid order delays.</p>
                </div>
                <button class="notification-dismiss-btn" aria-label="Dismiss Notification">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          </div>
          
        </div>

        <!-- Right Column: Today's Offers, Active Orders, Order History -->
        <div class="db-main-column" style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
          
          <!-- Today's Offers Section -->
          <div class="db-card offers-card">
            <h3><i class="fa-solid fa-tags"></i> Today's Special Offers</h3>
            <hr class="db-divider">
            <div class="offers-grid" id="db-offers-grid">
              <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem 0; width: 100%;">
                Loading offers...
              </div>
            </div>
          </div>

          <!-- Active Orders (Tracking) -->
          <div class="db-card active-orders-card">
            <div class="card-header-flex">
              <h3><i class="fa-solid fa-clock"></i> Active Order Tracking</h3>
              <span class="active-orders-count" id="active-orders-count-badge">0 Active Orders</span>
            </div>
            <hr class="db-divider">
            <div class="db-orders-list" id="db-active-orders-container">
              <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem 0;">
                Loading active orders...
              </div>
            </div>
          </div>

          <!-- Order History -->
          <div class="db-card order-history-card">
            <h3><i class="fa-solid fa-file-invoice"></i> Order History</h3>
            <hr class="db-divider">
            <div class="history-list" id="db-history-list-container">
              <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 1.5rem 0;">
                Loading history...
              </div>
            </div>
          </div>
          
        </div>
        
      </div>
    </div>
  `;
}

/**
 * Attaches page-specific interactive logic to the DOM after rendering.
 */
export async function initDashboard() {
  const user = getCurrentSession();
  if (!user) return;

  if (user.role === 'admin') {
    initAdminDashboard();
    return;
  }

  console.log('Student dashboard page initialized.');

  // Bind logout button
  const logoutBtn = document.getElementById('db-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      updateNavbar();
      window.location.hash = '#/';
    });
  }

  // 1. Fetch and Render Offers from DB Offers API
  try {
    const res = await fetch('/api/offers');
    const offers = await res.json();
    const offersGrid = document.getElementById('db-offers-grid');
    if (offersGrid) {
      if (offers.length === 0) {
        offersGrid.innerHTML = `<div style="text-align: center; padding: 1rem; color: var(--text-muted);">No current offers available.</div>`;
      } else {
        const priceMap = {
          'off1': { price: '75.00', oldPrice: '90.00' },
          'off2': { price: '40.00', oldPrice: null },
          'off3': { price: '30.00', oldPrice: '35.00' }
        };

        offersGrid.innerHTML = offers.map(o => {
          const prices = priceMap[o.id] || { price: '50.00', oldPrice: null };
          const badgeClass = o.discount.toLowerCase() === 'healthy' ? 'healthy' : '';
          
          return `
            <div class="offer-card">
              <div class="offer-img-container">
                <img src="${o.image}" alt="${o.title}" onerror="this.src='https://placehold.co/250x120?text=Special+Offer'">
                <span class="offer-badge ${badgeClass}">${o.discount}</span>
              </div>
              <div class="offer-card-body">
                <h4>${o.title}</h4>
                <p>${o.description}</p>
                <div class="offer-price-row">
                  <div>
                    <span class="offer-price">EGP ${prices.price}</span>
                    ${prices.oldPrice ? `<span class="offer-old-price">EGP ${prices.oldPrice}</span>` : ''}
                  </div>
                  <a href="#/menu" class="offer-btn" aria-label="View meal offer"><i class="fa-solid fa-arrow-right"></i></a>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (e) {
    console.error('Error fetching offers:', e);
  }

  // 2. Fetch and Render Orders (Active + History) from Orders API
  try {
    const res = await fetch(`/api/orders?userId=${user.id}`);
    const allOrders = await res.json();

    const activeOrders = allOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready');
    const pastOrders = allOrders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');

    // Update active count badge
    const activeCountBadge = document.getElementById('active-orders-count-badge');
    if (activeCountBadge) {
      activeCountBadge.textContent = `${activeOrders.length} Active Order${activeOrders.length === 1 ? '' : 's'}`;
    }

    // Render Active
    const activeContainer = document.getElementById('db-active-orders-container');
    if (activeContainer) {
      if (activeOrders.length === 0) {
        activeContainer.innerHTML = `
          <div style="text-align: center; padding: 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">
            <i class="fa-solid fa-circle-check" style="color: #4CAF50; font-size: 1.5rem; display: block; margin-bottom: 0.5rem;"></i>
            No active orders. Add something tasty from the Menu!
          </div>
        `;
      } else {
        activeContainer.innerHTML = activeOrders.map(order => {
          const itemsText = order.items.map(i => `${i.quantity}x ${i.meal.name}`).join(', ');
          const isPending = order.status === 'Pending';
          const isPreparing = order.status === 'Preparing';
          const isReady = order.status === 'Ready';

          const statusClass = isPending ? 'status-pending' : isPreparing ? 'status-preparing' : 'status-ready';
          const statusText = isPending ? 'Awaiting Kitchen' : isPreparing ? 'Preparing in Kitchen' : 'Ready for Pickup';

          return `
            <div class="db-order-item">
              <div class="order-item-header">
                <span class="order-id"><i class="fa-solid fa-receipt"></i> Order #${order.id.slice(-6)}</span>
                <span class="order-status-badge ${statusClass}">${statusText}</span>
              </div>
              <div class="order-item-body">
                <p class="order-details-text">${itemsText}</p>
                
                <!-- Timeline -->
                <div class="order-timeline">
                  <div class="timeline-step completed">Ordered</div>
                  <div class="timeline-step ${isPreparing || isReady ? 'completed' : ''} ${isPreparing ? 'active' : ''}">Kitchen</div>
                  <div class="timeline-step ${isReady ? 'completed active' : ''}">Ready</div>
                </div>
              </div>
              <div class="order-item-footer">
                <span>Method: <strong>${order.paymentMethod === 'smart_card' ? 'Smart Card' : 'Cash'}</strong></span>
                <a href="#/orders" class="track-link">Track Detail <i class="fa-solid fa-arrow-right-long"></i></a>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render History
    const historyContainer = document.getElementById('db-history-list-container');
    if (historyContainer) {
      if (pastOrders.length === 0) {
        historyContainer.innerHTML = `
          <div style="text-align: center; padding: 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">
            No past orders found.
          </div>
        `;
      } else {
        historyContainer.innerHTML = pastOrders.slice(0, 3).map(order => {
          const itemsText = order.items.map(i => `${i.quantity}x ${i.meal.name}`).join(', ');
          const isCompleted = order.status === 'Completed';
          const dateText = new Date(order.date).toLocaleDateString([], { month: 'short', day: 'numeric' });

          return `
            <div class="history-item">
              <div class="history-item-left">
                <span class="history-item-id">Order #${order.id.slice(-6)}</span>
                <span class="history-item-date">${dateText}</span>
                <span class="history-item-details">${itemsText}</span>
              </div>
              <div class="history-item-right">
                <span class="history-item-price">EGP ${order.total.toFixed(2)}</span>
                <span class="order-status-badge ${isCompleted ? 'status-completed' : 'status-cancelled'}">${order.status}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (e) {
    console.error('Error fetching orders:', e);
  }

  // Bind notification dismiss buttons
  const dismissBtns = document.querySelectorAll('.notification-dismiss-btn');
  dismissBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const item = e.target.closest('.notification-item');
      if (item) {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.remove();
          
          // If all notifications are dismissed, render a friendly empty state
          const list = document.querySelector('.notifications-list');
          if (list && list.children.length === 0) {
            list.innerHTML = `
              <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: var(--spacing-md) 0;">
                <i class="fa-solid fa-bell-slash" style="margin-bottom: var(--spacing-sm); display: block; font-size: 1.2rem;"></i>
                No new notifications.
              </div>
            `;
          }
        }, 200);
      }
    });
  });

  // Top Up button click interaction
  const topupBtn = document.querySelector('.balance-topup-btn');
  if (topupBtn) {
    topupBtn.addEventListener('click', () => {
      alert('Smart Card Balance Top Up feature is coming soon! Please visit the school canteen admin office.');
    });
  }
}

import { getCurrentSession, getAdminOrders, updateOrderStatus, clearSession } from '../services/db.js';
import { updateNavbar } from '../app.js';
import { meals, updateMealPrice, addMeal, deleteMeal } from '../services/meals.js';

export function renderAdminDashboard() {
  const user = getCurrentSession();
  return `
    <div class="dashboard-container">
      
      <!-- Manage Prices Drawer -->
      <div class="cart-overlay" id="prices-overlay"></div>
      <div class="slide-out-cart" id="prices-slide-panel" style="display: flex; flex-direction: column;">
        <div class="cart-header">
          <h3>Manage Canteen Menu</h3>
          <button class="close-cart-btn" id="close-prices-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        
        <!-- Add Meal Form -->
        <div class="admin-add-meal-section">
          <h4><i class="fa-solid fa-circle-plus"></i> Add New Meal</h4>
          <form id="admin-add-meal-form">
            <div class="form-row" style="margin-bottom: 0.5rem;">
              <input type="text" id="new-meal-name" placeholder="Meal name" required>
              <input type="number" id="new-meal-price" placeholder="Price" min="1" required style="width: 100px;">
            </div>
            <div class="form-row" style="margin-bottom: 0.5rem;">
              <select id="new-meal-category" required>
                <option value="" disabled selected>Category</option>
                <option value="burgers">Burgers</option>
                <option value="pizza">Pizza</option>
                <option value="sandwiches">Sandwiches</option>
                <option value="chicken">Chicken</option>
                <option value="pasta">Pasta</option>
                <option value="salads">Salads</option>
                <option value="desserts">Desserts</option>
                <option value="drinks">Drinks</option>
              </select>
            </div>
            <input type="text" id="new-meal-image" placeholder="Image URL (optional)" style="margin-bottom: 0.5rem;">
            <textarea id="new-meal-desc" placeholder="Brief description..." rows="2" style="margin-bottom: 0.5rem;"></textarea>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Add to Menu</button>
          </form>
        </div>

        <div class="prices-list-container" id="prices-list-container" style="flex: 1; overflow-y: auto;">
          <!-- Meals list injected dynamically -->
        </div>
      </div>

      <!-- Welcome Banner -->
      <div class="db-welcome-banner admin-banner">
        <div class="db-welcome-text">
          <span class="db-greeting">Canteen Control Room 🛠️</span>
          <h2 class="db-student-name">${user ? user.name : 'Admin'} (Admin)</h2>
          <p class="db-email">Staff Access Active</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
          <div style="display: flex; gap: var(--spacing-sm);">
            <button class="db-logout-btn btn-manage-prices" id="db-prices-btn" style="background: var(--accent-orange); color: white; border: none; margin-right: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-tags"></i> Edit Prices
            </button>
            <button class="db-logout-btn" id="db-logout-btn">
              <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
          </div>
          <span class="admin-email-subtext" style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.7); margin-top: 6px; font-weight: 500;">
            <i class="fa-solid fa-envelope"></i> ${user ? user.email : ''}
          </span>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="admin-stats-row">
        <div class="admin-stat-card">
          <div class="stat-icon pending"><i class="fa-solid fa-receipt"></i></div>
          <div class="stat-info">
            <h4 id="stat-pending-count">0</h4>
            <p>New Requests</p>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="stat-icon preparing"><i class="fa-solid fa-fire-burner"></i></div>
          <div class="stat-info">
            <h4 id="stat-preparing-count">0</h4>
            <p>Preparing</p>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="stat-icon ready"><i class="fa-solid fa-bell"></i></div>
          <div class="stat-info">
            <h4 id="stat-ready-count">0</h4>
            <p>Almost Finished</p>
          </div>
        </div>
        <div class="admin-stat-card">
          <div class="stat-icon completed"><i class="fa-solid fa-circle-check"></i></div>
          <div class="stat-info">
            <h4 id="stat-completed-revenue">EGP 0.00</h4>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board">
        <!-- Incoming Column -->
        <div class="kanban-column">
          <div class="column-header pending">
            <h3><i class="fa-solid fa-inbox"></i> Incoming Requests</h3>
            <span class="column-badge" id="badge-pending">0</span>
          </div>
          <div class="kanban-cards-container" id="column-pending-container">
            <!-- Cards go here -->
          </div>
        </div>

        <!-- Kitchen prep Column -->
        <div class="kanban-column">
          <div class="column-header preparing">
            <h3><i class="fa-solid fa-kitchen-set"></i> Kitchen Prep</h3>
            <span class="column-badge" id="badge-preparing">0</span>
          </div>
          <div class="kanban-cards-container" id="column-preparing-container">
            <!-- Cards go here -->
          </div>
        </div>

        <!-- Ready Column -->
        <div class="kanban-column">
          <div class="column-header ready">
            <h3><i class="fa-solid fa-circle-check"></i> Ready for Pickup</h3>
            <span class="column-badge" id="badge-ready">0</span>
          </div>
          <div class="kanban-cards-container" id="column-ready-container">
            <!-- Cards go here -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initAdminDashboard() {
  console.log('Admin Canteen Board initialized');
  
  // Bind Logout
  const logoutBtn = document.getElementById('db-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      updateNavbar();
      window.location.hash = '#/';
    });
  }

  // Bind Manage Prices Open/Close
  const pricesBtn = document.getElementById('db-prices-btn');
  const pricesOverlay = document.getElementById('prices-overlay');
  const pricesPanel = document.getElementById('prices-slide-panel');
  const closePricesBtn = document.getElementById('close-prices-btn');

  function openPrices() {
    renderPricesList();
    pricesOverlay.classList.add('active');
    pricesPanel.classList.add('active');
  }

  function closePrices() {
    pricesOverlay.classList.remove('active');
    pricesPanel.classList.remove('active');
  }

  if (pricesBtn) pricesBtn.addEventListener('click', openPrices);
  if (pricesOverlay) pricesOverlay.addEventListener('click', closePrices);
  if (closePricesBtn) closePricesBtn.addEventListener('click', closePrices);

  // Bind Add Meal Form Submit
  const addMealForm = document.getElementById('admin-add-meal-form');
  if (addMealForm) {
    addMealForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-meal-name').value.trim();
      const price = parseFloat(document.getElementById('new-meal-price').value);
      const category = document.getElementById('new-meal-category').value;
      const imageInput = document.getElementById('new-meal-image').value.trim();
      const description = document.getElementById('new-meal-desc').value.trim();

      if (!name || isNaN(price) || price <= 0 || !category) {
        alert('Please fill out all required fields with valid values.');
        return;
      }

      // Default image if none provided
      const image = imageInput || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600&h=400';

      const res = await addMeal({
        name,
        price,
        category,
        image,
        description
      });

      if (res) {
        addMealForm.reset();
        renderPricesList();
        alert(`"${name}" has been successfully added to the menu!`);
      } else {
        alert('Failed to add meal. Server error.');
      }
    });
  }

  await renderKanbanBoard();
}

function renderPricesList() {
  const container = document.getElementById('prices-list-container');
  if (!container) return;

  container.innerHTML = meals.map(meal => `
    <div class="price-edit-item" data-id="${meal.id}">
      <div class="price-edit-info" style="flex: 1; padding-right: 0.5rem;">
        <h5 style="margin: 0 0 2px 0; font-size: 0.95rem;">${meal.name}</h5>
        <span style="font-size: 0.75rem; color: var(--text-light); text-transform: uppercase;">${meal.category}</span>
      </div>
      <div class="price-edit-actions" style="display: flex; align-items: center; gap: 0.35rem;">
        <span class="price-currency" style="font-size: 0.8rem; font-weight: 700; color: var(--text-light);">EGP</span>
        <input type="number" class="price-edit-input" data-id="${meal.id}" value="${meal.price}" min="1" style="width: 70px; padding: 0.35rem; font-size: 0.9rem; text-align: center; border: 1px solid var(--border-light); border-radius: 6px;">
        <button class="price-save-check-btn" data-id="${meal.id}" aria-label="Save Price" style="background: none; border: none; color: var(--text-light); cursor: pointer; font-size: 1.1rem; padding: 0.25rem;">
          <i class="fa-solid fa-check"></i>
        </button>
        <button class="price-delete-meal-btn" data-id="${meal.id}" aria-label="Delete Meal" style="background: none; border: none; color: var(--primary-red); cursor: pointer; font-size: 1rem; padding: 0.25rem;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');

  // Bind individual save buttons
  container.querySelectorAll('.price-save-check-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const mealId = e.currentTarget.dataset.id;
      const input = container.querySelector(`input[data-id="${mealId}"]`);
      if (input) {
        const val = parseFloat(input.value);
        if (isNaN(val) || val <= 0) {
          alert('Please enter a valid positive price.');
          return;
        }
        
        const ok = await updateMealPrice(mealId, val);
        if (ok) {
          // Show success indicator on the check button
          const icon = btn.querySelector('i');
          icon.className = 'fa-solid fa-circle-check';
          btn.style.color = '#4CAF50';
          setTimeout(() => {
            icon.className = 'fa-solid fa-check';
            btn.style.color = '';
          }, 1000);
        } else {
          alert('Failed to update price. Server error.');
        }
      }
    });
  });

  // Bind individual delete buttons
  container.querySelectorAll('.price-delete-meal-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const mealId = e.currentTarget.dataset.id;
      const meal = meals.find(m => m.id === mealId);
      if (!meal) return;

      if (confirm(`Are you sure you want to permanently delete "${meal.name}" from the menu?`)) {
        const ok = await deleteMeal(mealId);
        if (ok) {
          renderPricesList();
        } else {
          alert('Failed to delete meal. Server error.');
        }
      }
    });
  });
}

async function renderKanbanBoard() {
  const orders = await getAdminOrders();

  // Group orders
  const pendingOrders = orders.filter(o => o.status === 'Pending');
  const preparingOrders = orders.filter(o => o.status === 'Preparing');
  const readyOrders = orders.filter(o => o.status === 'Ready');
  const completedOrders = orders.filter(o => o.status === 'Completed');

  // Update Stats & Badges
  const pendingCountEl = document.getElementById('stat-pending-count');
  if (pendingCountEl) pendingCountEl.textContent = pendingOrders.length;
  const prepCountEl = document.getElementById('stat-preparing-count');
  if (prepCountEl) prepCountEl.textContent = preparingOrders.length;
  const readyCountEl = document.getElementById('stat-ready-count');
  if (readyCountEl) readyCountEl.textContent = readyOrders.length;

  const badgePending = document.getElementById('badge-pending');
  if (badgePending) badgePending.textContent = pendingOrders.length;
  const badgePreparing = document.getElementById('badge-preparing');
  if (badgePreparing) badgePreparing.textContent = preparingOrders.length;
  const badgeReady = document.getElementById('badge-ready');
  if (badgeReady) badgeReady.textContent = readyOrders.length;

  // Calculate revenue
  const revenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueEl = document.getElementById('stat-completed-revenue');
  if (revenueEl) revenueEl.textContent = `EGP ${revenue.toFixed(2)}`;

  // Helper to map items HTML
  const getItemsHtml = (items) => {
    return items.map(item => `
      <div class="kanban-card-item">
        <span>${item.quantity}x ${item.meal.name}</span>
        <span class="item-category">${item.meal.category}</span>
      </div>
    `).join('');
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Populate Columns
  const pendingContainer = document.getElementById('column-pending-container');
  const preparingContainer = document.getElementById('column-preparing-container');
  const readyContainer = document.getElementById('column-ready-container');

  if (!pendingContainer || !preparingContainer || !readyContainer) return;

  // Populate Pending
  if (pendingOrders.length === 0) {
    pendingContainer.innerHTML = `<div class="kanban-empty-msg">No new requests</div>`;
  } else {
    pendingContainer.innerHTML = pendingOrders.map(order => `
      <div class="kanban-card pending-border">
        <div class="kanban-card-header">
          <span class="card-order-id">Order #${order.id.slice(-6)}</span>
          <span class="card-time">${formatDate(order.date)}</span>
        </div>
        <div class="kanban-card-items-list">
          ${getItemsHtml(order.items)}
        </div>
        <div class="kanban-card-meta">
          <span class="card-payment"><i class="fa-solid fa-wallet"></i> ${order.paymentMethod === 'smart_card' ? 'Smart Card' : 'Cash'}</span>
          <span class="card-total">EGP ${order.total.toFixed(2)}</span>
        </div>
        <button class="btn-primary kanban-action-btn accept-btn" data-id="${order.id}">
          Accept to Kitchen <i class="fa-solid fa-fire-burner"></i>
        </button>
      </div>
    `).join('');
  }

  // Populate Preparing
  if (preparingOrders.length === 0) {
    preparingContainer.innerHTML = `<div class="kanban-empty-msg">Kitchen is empty</div>`;
  } else {
    preparingContainer.innerHTML = preparingOrders.map(order => `
      <div class="kanban-card preparing-border">
        <div class="kanban-card-header">
          <span class="card-order-id">Order #${order.id.slice(-6)}</span>
          <span class="card-time">${formatDate(order.date)}</span>
        </div>
        <div class="kanban-card-items-list">
          ${getItemsHtml(order.items)}
        </div>
        <div class="kanban-card-meta">
          <span class="card-payment"><i class="fa-solid fa-wallet"></i> ${order.paymentMethod === 'smart_card' ? 'Smart Card' : 'Cash'}</span>
          <span class="card-total">EGP ${order.total.toFixed(2)}</span>
        </div>
        <button class="btn-primary kanban-action-btn ready-btn" data-id="${order.id}">
          Mark as Ready <i class="fa-solid fa-bell"></i>
        </button>
      </div>
    `).join('');
  }

  // Populate Ready
  if (readyOrders.length === 0) {
    readyContainer.innerHTML = `<div class="kanban-empty-msg">No orders ready for pickup</div>`;
  } else {
    readyContainer.innerHTML = readyOrders.map(order => `
      <div class="kanban-card ready-border">
        <div class="kanban-card-header">
          <span class="card-order-id">Order #${order.id.slice(-6)}</span>
          <span class="card-time">${formatDate(order.date)}</span>
        </div>
        <div class="kanban-card-items-list">
          ${getItemsHtml(order.items)}
        </div>
        <div class="kanban-card-meta">
          <span class="card-payment"><i class="fa-solid fa-wallet"></i> ${order.paymentMethod === 'smart_card' ? 'Smart Card' : 'Cash'}</span>
          <span class="card-total">EGP ${order.total.toFixed(2)}</span>
        </div>
        <button class="btn-primary kanban-action-btn complete-btn" data-id="${order.id}">
          Complete Order <i class="fa-solid fa-circle-check"></i>
        </button>
      </div>
    `).join('');
  }

  // Bind Kanban Actions
  document.querySelectorAll('.kanban-action-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const orderId = e.currentTarget.dataset.id;
      let nextStatus = 'Pending';
      if (e.currentTarget.classList.contains('accept-btn')) nextStatus = 'Preparing';
      else if (e.currentTarget.classList.contains('ready-btn')) nextStatus = 'Ready';
      else if (e.currentTarget.classList.contains('complete-btn')) nextStatus = 'Completed';

      const ok = await updateOrderStatus(orderId, nextStatus);
      if (ok) {
        await renderKanbanBoard();
      } else {
        alert('Failed to update status. Server error.');
      }
    });
  });
}

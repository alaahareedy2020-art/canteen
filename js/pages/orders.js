import { getCurrentSession, getUserOrders } from '../services/db.js';

let timerInterval = null;

export function renderOrders() {
  const user = getCurrentSession();
  if (!user) {
    return `
      <div class="section-container" style="padding: var(--spacing-xxl) 0; text-align: center;">
        <h2 class="section-title" style="color: var(--primary-red);"><i class="fa-solid fa-triangle-exclamation"></i> Access Denied</h2>
        <p class="section-desc">Please log in to track your canteen orders.</p>
        <div style="margin-top: 2rem;">
          <a href="#/login" class="btn-primary">Log In</a>
        </div>
      </div>
    `;
  }

  return `
    <div class="orders-page-container section-container">
      <h2 class="section-title"><i class="fa-solid fa-clock-rotate-left"></i> Track Your Orders</h2>
      <p class="section-desc" style="margin-bottom: 2rem;">Monitor your active food prep status and view order history below.</p>

      <div class="orders-layout">
        <!-- Active Orders Section -->
        <div class="active-orders-section">
          <h3 class="orders-subtitle"><i class="fa-solid fa-fire"></i> Active Orders</h3>
          <div id="active-orders-container" class="orders-cards-stack">
            <!-- Active order cards injected here -->
          </div>
        </div>

        <!-- Past Orders Section -->
        <div class="past-orders-section">
          <h3 class="orders-subtitle"><i class="fa-solid fa-history"></i> Order History</h3>
          <div id="past-orders-container" class="past-orders-stack">
            <!-- Past orders injected here -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function initOrders() {
  console.log('Orders page initialized');
  
  const user = getCurrentSession();
  if (!user) return;

  await renderOrdersLists(user.id);

  // Set up live countdown interval
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    updateActiveCountdowns(user.id);
  }, 1000);
}

async function renderOrdersLists(userId) {
  const activeContainer = document.getElementById('active-orders-container');
  const pastContainer = document.getElementById('past-orders-container');
  
  if (!activeContainer || !pastContainer) return;

  const allOrders = await getUserOrders(userId);
  const activeOrders = allOrders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready');
  const pastOrders = allOrders.filter(o => o.status === 'Completed' || o.status === 'Cancelled');

  // Render Active
  if (activeOrders.length === 0) {
    activeContainer.innerHTML = `
      <div class="empty-orders-card">
        <i class="fa-solid fa-bowl-food empty-orders-icon"></i>
        <h4>No active orders</h4>
        <p>Hungry? Place an order on the menu page to start tracking.</p>
        <a href="#/menu" class="btn-primary" style="margin-top: 1rem; font-size: 0.9rem; justify-content: center; width: fit-content; margin-left: auto; margin-right: auto;">Order Food Now</a>
      </div>
    `;
  } else {
    activeContainer.innerHTML = activeOrders.map(order => {
      const itemsText = order.items.map(i => `${i.quantity}x ${i.meal.name}`).join(', ');
      const isPending = order.status === 'Pending';
      const isPreparing = order.status === 'Preparing';
      const isReady = order.status === 'Ready';

      return `
        <div class="active-order-tracking-card" data-id="${order.id}">
          <div class="tracking-card-header">
            <div>
              <span class="tracking-order-id">Order #${order.id.slice(-6)}</span>
              <span class="tracking-order-date">${new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <span class="status-badge-tracking ${order.status.toLowerCase()}">${order.status}</span>
          </div>
          
          <p class="tracking-items">${itemsText}</p>
          
          <!-- Visual Timeline -->
          <div class="tracking-timeline">
            <div class="timeline-node completed">
              <div class="node-circle"><i class="fa-solid fa-check"></i></div>
              <span>Ordered</span>
            </div>
            <div class="timeline-node ${isPreparing || isReady ? 'completed' : ''} ${isPreparing ? 'active' : ''}">
              <div class="node-circle"><i class="fa-solid fa-fire-burner"></i></div>
              <span>Preparing</span>
            </div>
            <div class="timeline-node ${isReady ? 'completed' : ''} ${isReady ? 'active' : ''}">
              <div class="node-circle"><i class="fa-solid fa-bell"></i></div>
              <span>Ready</span>
            </div>
          </div>

          <!-- Dynamic Status Text / Countdown -->
          <div class="countdown-display" data-status="${order.status}" data-date="${order.date}">
            ${getPlaceholderStatusText(order.status, order.date)}
          </div>
          
          <div class="tracking-card-footer">
            <span>Payment: <strong>${order.paymentMethod === 'smart_card' ? 'Smart Card' : 'Cash'}</strong></span>
            <span>Total: <strong>EGP ${order.total.toFixed(2)}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Past
  if (pastOrders.length === 0) {
    pastContainer.innerHTML = `
      <div class="empty-orders-card small">
        <p>No order history yet.</p>
      </div>
    `;
  } else {
    pastContainer.innerHTML = pastOrders.map(order => {
      const itemsText = order.items.map(i => `${i.quantity}x ${i.meal.name}`).join(', ');
      const isCompleted = order.status === 'Completed';
      
      return `
        <div class="past-order-card">
          <div class="past-card-top">
            <div>
              <span class="past-order-id">Order #${order.id.slice(-6)}</span>
              <span class="past-order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <span class="order-status-badge ${isCompleted ? 'status-completed' : 'status-cancelled'}">${order.status}</span>
          </div>
          <p class="past-items">${itemsText}</p>
          <div class="past-card-bottom">
            <span>Total Paid: <strong>EGP ${order.total.toFixed(2)}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function getPlaceholderStatusText(status, dateStr) {
  if (status === 'Pending') {
    return `<i class="fa-solid fa-hourglass-start animate-spin"></i> Awaiting kitchen approval... (Est: 15 mins)`;
  }
  if (status === 'Preparing') {
    return `<i class="fa-solid fa-clock"></i> Preparing: Calculating remaining time...`;
  }
  if (status === 'Ready') {
    return `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i> Ready for Pickup! Please proceed to the canteen counter.`;
  }
  return '';
}

function updateActiveCountdowns(userId) {
  const displays = document.querySelectorAll('.countdown-display');
  displays.forEach(display => {
    const status = display.dataset.status;
    const dateStr = display.dataset.date;
    
    if (status === 'Pending') {
      display.innerHTML = `<i class="fa-solid fa-hourglass-start animate-spin"></i> Awaiting approval... (Est: 15 mins)`;
    } else if (status === 'Preparing') {
      const placementTime = new Date(dateStr);
      const timePassedSecs = Math.floor((new Date() - placementTime) / 1000);
      const totalPrepSecs = 10 * 60; // 10 mins estimated preparation
      const remainingSecs = totalPrepSecs - timePassedSecs;

      if (remainingSecs <= 0) {
        display.innerHTML = `<i class="fa-solid fa-kitchen-set animate-pulse"></i> Preparing: Finishing up... (Less than a minute)`;
      } else {
        const mins = Math.floor(remainingSecs / 60);
        const secs = remainingSecs % 60;
        display.innerHTML = `<i class="fa-solid fa-clock animate-pulse"></i> Preparing: <strong>${mins}m ${secs}s left</strong> until ready.`;
      }
    } else if (status === 'Ready') {
      display.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #4CAF50;"></i> Ready for pickup! Please proceed to the canteen counter.`;
    }
  });
}

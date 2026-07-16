import { AppState, updateCartBadge } from '../app.js';
import { getCurrentSession, addOrder } from '../services/db.js';

export function renderCart() {
  const user = getCurrentSession();
  return `
    <div class="cart-page-layout section-container">
      
      <!-- Fullscreen Checkout processing Modal -->
      <div class="loader-modal-overlay" id="checkout-loader-modal" style="display: none;">
        <div class="loader-modal-card">
          <div class="loader-spinner-container" id="modal-spinner-section">
            <div class="loader"></div>
          </div>
          <div class="loader-success-container" id="modal-success-section" style="display: none;">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3 class="loader-modal-title" id="modal-loader-title">Processing Order</h3>
          <p class="loader-modal-desc" id="modal-loader-desc">Please wait while we verify your details.</p>
        </div>
      </div>

      <div class="cart-items-section">
        <h2 class="section-title">Review Your Order</h2>
        <div id="full-cart-container" class="full-cart-list">
          <!-- Items injected here -->
        </div>
      </div>
      
      <div class="checkout-section">
        <div class="checkout-box">
          <h3 class="checkout-title">Order Summary</h3>
          
          <div class="user-email-badge" id="cart-user-email">
            <i class="fa-solid fa-envelope"></i> Ordering as: <strong>${user ? user.email : ''}</strong>
          </div>

          <!-- Academic Promo Banner -->
          <div class="academic-discount-banner" id="academic-discount-banner" style="display: none;">
            <i class="fa-solid fa-graduation-cap"></i>
            <span><strong>Academic Merit Promo!</strong> 15% discount applied for your last term Grade A! 🏆</span>
          </div>

          <div class="summary-line">
            <span>Subtotal</span>
            <span id="checkout-subtotal">EGP 0.00</span>
          </div>
          <div class="summary-line">
            <span>Fees (5%)</span>
            <span id="checkout-fees">EGP 0.00</span>
          </div>
          <!-- Discount line item -->
          <div class="summary-line academic-discount-line" id="checkout-discount-row" style="display: none; color: #4CAF50; font-weight: 700;">
            <span>Academic Promo (15%)</span>
            <span id="checkout-discount">-EGP 0.00</span>
          </div>
          <div class="summary-total">
            <span>Total</span>
            <span id="checkout-total">EGP 0.00</span>
          </div>
          
          <h4 class="payment-title">Payment Method</h4>
          <div class="payment-methods">
            <label class="payment-option">
              <input type="radio" name="payment" value="smart_card" checked>
              <div class="payment-card">
                <i class="fa-regular fa-credit-card"></i>
                <span>Smart Card</span>
              </div>
            </label>
            <label class="payment-option">
              <input type="radio" name="payment" value="cash">
              <div class="payment-card">
                <i class="fa-solid fa-coins"></i>
                <span>Cash on Pickup</span>
              </div>
            </label>
          </div>
          
          <button class="btn-primary checkout-btn-full" id="place-order-btn">Place Order</button>
        </div>
      </div>
    </div>
  `;
}

function updateFullCartUI() {
  const container = document.getElementById('full-cart-container');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const feesEl = document.getElementById('checkout-fees');
  const discountRow = document.getElementById('checkout-discount-row');
  const discountVal = document.getElementById('checkout-discount');
  const discountBanner = document.getElementById('academic-discount-banner');
  const totalEl = document.getElementById('checkout-total');
  
  if (!container) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-cart-arrow-down empty-icon"></i>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <a href="#/menu" class="btn-primary" style="margin-top: 1rem;">Browse Menu</a>
      </div>
    `;
    subtotalEl.textContent = 'EGP 0.00';
    feesEl.textContent = 'EGP 0.00';
    totalEl.textContent = 'EGP 0.00';
    if (discountRow) discountRow.style.display = 'none';
    if (discountBanner) discountBanner.style.display = 'none';
    return;
  }

  let subtotal = 0;
  
  container.innerHTML = AppState.cart.map((item, index) => {
    const itemTotal = item.meal.price * item.quantity;
    subtotal += itemTotal;
    
    return `
      <div class="full-cart-item">
        <img src="${item.meal.image}" alt="${item.meal.name}" class="full-cart-img">
        <div class="full-cart-details">
          <h4>${item.meal.name}</h4>
          <span class="full-cart-price">EGP ${item.meal.price}</span>
        </div>
        <div class="quantity-controls">
          <button class="qty-btn minus" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn plus" data-index="${index}">+</button>
        </div>
        <div class="full-cart-item-total">
          EGP ${itemTotal.toFixed(2)}
        </div>
        <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  }).join('');

  // Calculate totals
  const fees = subtotal * 0.05;
  const baseTotal = subtotal + fees;

  subtotalEl.textContent = `EGP ${subtotal.toFixed(2)}`;
  feesEl.textContent = `EGP ${fees.toFixed(2)}`;

  // Verify merit discount eligibility (Grade A)
  const sessionUser = getCurrentSession();
  const isEligible = sessionUser && sessionUser.termGrade === 'A';

  if (isEligible) {
    const discount = baseTotal * 0.15;
    const finalTotal = baseTotal - discount;
    
    if (discountRow) discountRow.style.display = 'flex';
    if (discountVal) discountVal.textContent = `-EGP ${discount.toFixed(2)}`;
    if (discountBanner) discountBanner.style.display = 'flex';
    totalEl.textContent = `EGP ${finalTotal.toFixed(2)}`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
    if (discountBanner) discountBanner.style.display = 'none';
    totalEl.textContent = `EGP ${baseTotal.toFixed(2)}`;
  }

  // Bind plus/minus/remove events
  container.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.index;
      AppState.cart[idx].quantity += 1;
      updateCartBadge();
      updateFullCartUI();
    });
  });

  container.querySelectorAll('.qty-btn.minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.index;
      if (AppState.cart[idx].quantity > 1) {
        AppState.cart[idx].quantity -= 1;
      } else {
        AppState.cart.splice(idx, 1);
      }
      updateCartBadge();
      updateFullCartUI();
    });
  });

  container.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.index;
      AppState.cart.splice(idx, 1);
      updateCartBadge();
      updateFullCartUI();
    });
  });
}

export function initCart() {
  console.log('Cart page initialized');
  updateFullCartUI();

  const placeOrderBtn = document.getElementById('place-order-btn');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      if (AppState.cart.length === 0) {
        alert('Your cart is empty! Please add items before checking out.');
        return;
      }

      const session = getCurrentSession();
      if (!session) {
        window.location.hash = '#/login';
        return;
      }

      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      const subtotal = AppState.cart.reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
      const fees = subtotal * 0.05;
      const baseTotal = subtotal + fees;

      const isEligible = session && session.termGrade === 'A';
      const discount = isEligible ? baseTotal * 0.15 : 0;
      const total = baseTotal - discount;

      // Trigger Loader Modal
      const loaderModal = document.getElementById('checkout-loader-modal');
      const spinnerSection = document.getElementById('modal-spinner-section');
      const successSection = document.getElementById('modal-success-section');
      const modalTitle = document.getElementById('modal-loader-title');
      const modalDesc = document.getElementById('modal-loader-desc');

      if (loaderModal) {
        // Reset and Show Modal
        spinnerSection.style.display = 'flex';
        successSection.style.display = 'none';
        
        if (paymentMethod === 'smart_card') {
          modalTitle.textContent = 'Verifying Smart Card';
          modalDesc.textContent = 'Securing transaction with ELSEWEDY Canteen networks...';
        } else {
          modalTitle.textContent = 'Confirming Pickup';
          modalDesc.textContent = 'Preparing checkout for Cash on Pickup...';
        }
        
        loaderModal.style.display = 'flex';

        // Simulate network payment validation
        setTimeout(async () => {
          // Change loader to green checkmark success
          spinnerSection.style.display = 'none';
          successSection.style.display = 'flex';
          modalTitle.textContent = 'Order Placed!';
          modalDesc.textContent = isEligible 
            ? 'Order sent to kitchen! Your 15% Academic Discount was applied.'
            : 'Your order is sent to the kitchen. Redirecting to Dashboard...';

          // Save the order to DB
          const orderData = {
            items: [...AppState.cart],
            paymentMethod: paymentMethod,
            subtotal: subtotal,
            discount: discount,
            total: total
          };
          await addOrder(session.id, orderData);

          // Clear cart
          AppState.cart = [];
          updateCartBadge();

          // Wait and redirect
          setTimeout(() => {
            loaderModal.style.display = 'none';
            window.location.hash = '#/dashboard';
          }, 1500);

        }, 2000);
      }
    });
  }
}

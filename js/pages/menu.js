import { meals, categories } from '../services/meals.js';
import { updateCartBadge, AppState } from '../app.js';

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popular'; 

export function renderMenu() {
  return `
    <div class="menu-page-container">
      
      <!-- Floating Cart Button -->
      <button class="floating-cart-btn" id="floating-cart-btn">
        <i class="fa-solid fa-cart-shopping"></i>
        <span class="float-cart-count" id="float-cart-count">0</span>
      </button>

      <!-- Slide-out Cart Overlay -->
      <div class="cart-overlay" id="cart-overlay"></div>
      <div class="slide-out-cart" id="slide-out-cart">
        <div class="cart-header">
          <h3>Your Order</h3>
          <button class="close-cart-btn" id="close-cart-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="cart-items" id="cart-items-container">
          <!-- Cart items injected here -->
        </div>
        <div class="cart-footer">
          <div class="cart-total">
            <span>Total:</span>
            <span id="cart-total-price">EGP 0.00</span>
          </div>
          <a href="#/cart" class="btn-primary checkout-btn" style="width: 100%; justify-content: center;">Proceed to Checkout</a>
        </div>
      </div>

      <!-- Hero Section -->
      <section class="menu-hero">
        <div class="menu-hero-content">
          <h1 class="menu-hero-title">Discover Delicious Meals</h1>
          <p class="menu-hero-subtitle">Fresh ingredients, amazing taste, delivered fast.</p>
          <button class="btn-primary order-now-btn" onclick="document.getElementById('search-bar').focus();">
            Order Now <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>

      <!-- Search and Filters Section -->
      <section class="menu-controls section-container">
        <div class="search-bar-container">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input type="text" id="search-bar" class="search-input" placeholder="Search meals...">
        </div>
        
        <div class="filters-container">
          <div class="filter-group">
            <label><i class="fa-solid fa-arrow-up-short-wide"></i> Sort By:</label>
            <select id="sort-select" class="modern-select">
              <option value="popular">Popular</option>
              <option value="lowest">Lowest Price</option>
              <option value="highest">Highest Price</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section section-container">
        <div class="category-chips" id="category-chips-container">
          <!-- Chips injected via JS -->
        </div>
      </section>

      <!-- Today's Offers Section -->
      <section class="offers-section section-container">
        <div class="section-header-modern">
          <h2>Today's Offers</h2>
          <div class="countdown-timer">
            Ends in: <span id="offer-countdown">02:45:00</span>
          </div>
        </div>
        <div class="premium-offers-grid" id="offers-grid-container">
          <!-- Offers injected here -->
        </div>
      </section>

      <!-- Meal Grid Section -->
      <section class="meals-section section-container">
        <div class="section-header-modern">
          <h2>All Meals</h2>
        </div>
        <div class="meal-grid" id="meal-grid-container">
          <!-- Meals injected here -->
        </div>
      </section>
    </div>
  `;
}

function renderCategoryChips() {
  const container = document.getElementById('category-chips-container');
  if (!container) return;
  
  container.innerHTML = categories.map(cat => `
    <button class="category-chip ${currentCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
      <i class="fa-solid ${cat.icon}"></i> ${cat.name}
    </button>
  `).join('');

  container.querySelectorAll('.category-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      currentCategory = e.currentTarget.dataset.category;
      renderCategoryChips(); // re-render to update active state
      updateMealGrid();
    });
  });
}

function getFilteredAndSortedMeals() {
  let filtered = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                          meal.description.toLowerCase().includes(currentSearch.toLowerCase());
    const matchesCategory = currentCategory === 'all' || meal.category === currentCategory;
    return matchesSearch && matchesCategory;
  });

  filtered.sort((a, b) => {
    if (currentSort === 'lowest') return a.price - b.price;
    if (currentSort === 'highest') return b.price - a.price;
    if (currentSort === 'popular') return b.reviews - a.reviews;
    if (currentSort === 'newest') return a.badges.includes('New') ? -1 : 1;
    return 0;
  });

  return filtered;
}

function renderOffers() {
  const container = document.getElementById('offers-grid-container');
  if (!container) return;
  
  const offers = meals.filter(m => m.isOffer);
  
  container.innerHTML = offers.map(offer => `
    <div class="premium-offer-card">
      <div class="offer-image">
        <img src="${offer.image}" alt="${offer.name}">
        ${offer.discountBadge ? `<span class="discount-badge">${offer.discountBadge}</span>` : ''}
      </div>
      <div class="offer-details">
        <h3>${offer.name}</h3>
        <div class="offer-pricing">
          <span class="new-price">EGP ${offer.price}</span>
          ${offer.oldPrice ? `<span class="old-price">EGP ${offer.oldPrice}</span>` : ''}
        </div>
        <button class="btn-primary add-to-cart-btn" data-id="${offer.id}">Order Now</button>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    });
  });
}

function updateMealGrid() {
  const container = document.getElementById('meal-grid-container');
  if (!container) return;

  const displayMeals = getFilteredAndSortedMeals();
  
  if (displayMeals.length === 0) {
    container.innerHTML = `<div class="no-results">No meals found matching your criteria.</div>`;
    return;
  }

  container.innerHTML = displayMeals.map(meal => {
    const badgeHTML = meal.badges.map(b => `<span class="meal-badge ${b.toLowerCase().replace(' ', '-')}">${b}</span>`).join('');
    
    return `
      <div class="modern-meal-card">
        <div class="meal-image">
          <img src="${meal.image}" alt="${meal.name}">
          <div class="badges-container">${badgeHTML}</div>
          <button class="favorite-btn"><i class="fa-regular fa-heart"></i></button>
        </div>
        <div class="meal-content">
          <div class="meal-header">
            <h3>${meal.name}</h3>
            <span class="category-label">${categories.find(c => c.id === meal.category)?.name || meal.category}</span>
          </div>
          <p class="meal-desc">${meal.description}</p>
          <div class="meal-meta">
            <span class="rating"><i class="fa-solid fa-star"></i> ${meal.rating} (${meal.reviews})</span>
          </div>
          <div class="meal-footer">
            <span class="price">EGP ${meal.price}</span>
            <button class="add-cart-circle" data-id="${meal.id}" aria-label="Add to cart">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-bind add to cart buttons
  container.querySelectorAll('.add-cart-circle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      addToCart(id);
      
      // Ripple or feedback animation
      const icon = e.currentTarget.querySelector('i');
      if(icon) {
        icon.className = 'fa-solid fa-check';
        setTimeout(() => icon.className = 'fa-solid fa-plus', 1000);
      }
    });
  });
}

function addToCart(id) {
  const meal = meals.find(m => m.id === id);
  if (!meal) return;
  
  const existing = AppState.cart.find(i => i.meal.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    AppState.cart.push({ meal, quantity: 1 });
  }
  
  updateCartBadge();
  updateSlideOutCart();
  updateFloatingCartCount();
}

function updateFloatingCartCount() {
  const countEl = document.getElementById('float-cart-count');
  if (countEl) {
    const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = totalItems;
    countEl.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function updateSlideOutCart() {
  const container = document.getElementById('cart-items-container');
  const totalEl = document.getElementById('cart-total-price');
  if (!container || !totalEl) return;

  if (AppState.cart.length === 0) {
    container.innerHTML = `<div class="empty-cart-msg">Your cart is empty.</div>`;
    totalEl.textContent = 'EGP 0.00';
    return;
  }

  let total = 0;
  container.innerHTML = AppState.cart.map((item, index) => {
    const itemTotal = item.meal.price * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-slide-item">
        <img src="${item.meal.image}" alt="${item.meal.name}">
        <div class="item-details">
          <h4>${item.meal.name}</h4>
          <span class="item-price">EGP ${item.meal.price}</span>
          <div class="quantity-controls">
            <button class="qty-btn minus" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn plus" data-index="${index}">+</button>
          </div>
        </div>
        <button class="remove-item-btn" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
  }).join('');

  totalEl.textContent = `EGP ${total.toFixed(2)}`;

  // Bind controls
  container.querySelectorAll('.qty-btn.plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.index;
      AppState.cart[idx].quantity += 1;
      updateCartBadge();
      updateSlideOutCart();
      updateFloatingCartCount();
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
      updateSlideOutCart();
      updateFloatingCartCount();
    });
  });

  container.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.currentTarget.dataset.index;
      AppState.cart.splice(idx, 1);
      updateCartBadge();
      updateSlideOutCart();
      updateFloatingCartCount();
    });
  });
}

export function initMenu() {
  console.log('Menu page initialized.');
  
  renderCategoryChips();
  renderOffers();
  updateMealGrid();
  updateFloatingCartCount();
  updateSlideOutCart();

  // Search logic
  const searchInput = document.getElementById('search-bar');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      updateMealGrid();
    });
  }

  // Sort logic
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      updateMealGrid();
    });
  }

  // Slide-out cart toggle logic
  const floatBtn = document.getElementById('floating-cart-btn');
  const overlay = document.getElementById('cart-overlay');
  const slideCart = document.getElementById('slide-out-cart');
  const closeBtn = document.getElementById('close-cart-btn');

  function openCart() {
    overlay.classList.add('active');
    slideCart.classList.add('active');
  }

  function closeCart() {
    overlay.classList.remove('active');
    slideCart.classList.remove('active');
  }

  if (floatBtn) floatBtn.addEventListener('click', openCart);
  if (overlay) overlay.addEventListener('click', closeCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  
  // Timer mock
  let timeLeft = 2 * 3600 + 45 * 60; // 2h 45m
  const timerEl = document.getElementById('offer-countdown');
  if (timerEl) {
    setInterval(() => {
      if (timeLeft <= 0) return;
      timeLeft--;
      const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
      const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      timerEl.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }
}

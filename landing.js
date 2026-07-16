/**
 * Renders the HTML structure for the GenZCoders Canteen Landing Page.
 */
export function renderLanding() {
  return `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <div class="hero-content">
          <span class="hero-badge">
            <i class="fa-solid fa-bolt"></i> Reimagining the School Break
          </span>
          <h2 class="hero-title">
            Gen<span class="red-z">Z</span>Coders <br>Smart School Canteen
          </h2>
          <span class="hero-subtitle">ELSEWEDY ELECTOMETER</span>
          <p class="hero-description">
            Say goodbye to long school canteen queues. Browse daily meals, place your order online, and track its status in real-time. Fast, accurate, and completely digital.
          </p>
          <a href="#/menu" class="btn-primary" id="landing-order-btn">
            Order Now <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
        
        <!-- Premium Visual Cards and Patterns -->
        <div class="hero-visuals">
          <div class="hero-card-pattern">
            <!-- Floating Meal Card -->
            <div class="hero-card-floating c1">
              <div class="meal-badge">
                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=100&h=100" alt="Fresh Salad" onerror="this.src='https://placehold.co/100x100?text=Healthy+Meal'">
                <div class="meal-badge-info">
                  <h4>Healthy Salad Bowl</h4>
                  <p>EGP 45.00 • Today Available</p>
                </div>
              </div>
            </div>

            <!-- Floating Status Card -->
            <div class="hero-card-floating c2">
              <div class="status-badge">
                <div class="status-indicator"></div>
                <span>Order #4289: Ready for Pickup</span>
              </div>
            </div>

            <!-- Main Central Branding Card -->
            <div class="hero-card-floating c3">
              <div class="circle-logo-huge">
                <span>Z</span>
              </div>
              <h3>GenZCoders</h3>
              <p>ELSEWEDY ELECTOMETER</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Advantages Section -->
    <section class="advantages-section">
      <div class="section-container">
        <div class="section-header">
          <span class="section-tag">Features & Advantages</span>
          <h2 class="section-title">Solving Canteen Challenges</h2>
          <p class="section-desc">We created a modern digital canteen to make your school life easier and save valuable break time.</p>
        </div>
        
        <div class="advantages-grid">
          <!-- Advantage 1: Save Time -->
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fa-solid fa-user-clock"></i>
            </div>
            <h3>Zero Queue Waiting</h3>
            <p>Students spend most of their break waiting. Order ahead from your classroom and pick up your food immediately.</p>
          </div>

          <!-- Advantage 2: No Wrong Orders -->
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3>100% Order Accuracy</h3>
            <p>No more wrong orders. The digital menu lets you specify items and options, sending instructions directly to the kitchen.</p>
          </div>

          <!-- Advantage 3: Smart Kitchen Dashboard -->
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fa-solid fa-laptop-code"></i>
            </div>
            <h3>Automated Management</h3>
            <p>Goodbye manual paperwork. Canteen admins track orders, adjust stock, and update menus instantly on their dashboards.</p>
          </div>

          <!-- Advantage 4: Daily Meals Showcase -->
          <div class="advantage-card">
            <div class="advantage-icon">
              <i class="fa-solid fa-utensils"></i>
            </div>
            <h3>Instant Menu Browsing</h3>
            <p>Don't guess what's available today. Check prices, ingredients, and current stock levels right from the app.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action (CTA) Section -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-banner">
          <div class="cta-content">
            <h2>Ready to Upgrade Your Break?</h2>
            <p>Join the next generation of smart schooling. Register a free account, browse today's menu, and grab your meal in seconds.</p>
          </div>
          <div class="cta-actions">
            <a href="#/register" class="btn-primary" style="background-color: var(--primary-red); color: white;">
              Create Student Account <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Attaches page-specific interactive logic to the DOM after mounting.
 */
export function initLanding() {
  console.log('Landing page initialized successfully.');
}

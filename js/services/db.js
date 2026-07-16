const STORAGE_KEYS = {
  SESSION: 'genz_session'
};

/**
 * Registers a new student user.
 * @param {Object} userData - Contains name, email, password, age, grade, class, termGrade.
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export async function registerUser(userData) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error during registration:', e);
    return { success: false, message: 'Server communication error. Please try again.' };
  }
}

/**
 * Authenticates a user based on email and password.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { success: boolean, message: string, user: Object|null }
 */
export async function loginUser(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setCurrentSession(data.user);
    }
    return data;
  } catch (e) {
    console.error('Error during login:', e);
    return { success: false, message: 'Server communication error. Please try again.', user: null };
  }
}

/**
 * Sets the active session user in LocalStorage.
 * @param {Object} user 
 */
export function setCurrentSession(user) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
}

/**
 * Retrieves the currently active session user.
 * @returns {Object|null}
 */
export function getCurrentSession() {
  const sessionJson = localStorage.getItem(STORAGE_KEYS.SESSION);
  return sessionJson ? JSON.parse(sessionJson) : null;
}

/**
 * Clears the active session (Logout).
 */
export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/**
 * Adds a new order for a user.
 * @param {string} userId 
 * @param {Object} orderData 
 * @returns {Promise<Object>} The created order
 */
export async function addOrder(userId, orderData) {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...orderData })
    });
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error placing order:', e);
    return null;
  }
}

/**
 * Retrieves orders specifically for a given user ID.
 * @param {string} userId 
 * @returns {Promise<Array>} List of user orders
 */
export async function getUserOrders(userId) {
  try {
    const res = await fetch(`/api/orders?userId=${userId}`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error fetching user orders:', e);
    return [];
  }
}

/**
 * Retrieves all orders for the Admin dashboard.
 * @returns {Promise<Array>} List of all orders
 */
export async function getAdminOrders() {
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    return data;
  } catch (e) {
    console.error('Error fetching admin orders:', e);
    return [];
  }
}

/**
 * Updates the status of a specific order.
 * @param {string} orderId 
 * @param {string} newStatus 
 * @returns {Promise<boolean>} True if successful
 */
export async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    return res.ok;
  } catch (e) {
    console.error('Error updating order status:', e);
    return false;
  }
}

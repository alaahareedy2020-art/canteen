import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    // 1. Students/Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS Students (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        age INTEGER,
        grade TEXT,
        class TEXT,
        termGrade TEXT,
        registeredAt TEXT
      )
    `);

    // 2. Meals table
    db.run(`
      CREATE TABLE IF NOT EXISTS Meals (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        price REAL,
        category TEXT,
        rating REAL,
        reviews INTEGER,
        image TEXT,
        badges TEXT, -- JSON array string
        isOffer INTEGER, -- 0 or 1
        oldPrice REAL,
        discountBadge TEXT
      )
    `);

    // 3. Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS Orders (
        id TEXT PRIMARY KEY,
        userId TEXT,
        date TEXT,
        status TEXT,
        paymentMethod TEXT,
        subtotal REAL,
        discount REAL,
        total REAL,
        items TEXT -- JSON array string
      )
    `);

    // 4. Offers table (Dashboard promos)
    db.run(`
      CREATE TABLE IF NOT EXISTS Offers (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        discount TEXT,
        image TEXT,
        mealId TEXT
      )
    `);

    seedData();
  });
}

function seedData() {
  // Check and seed default admin account
  db.get("SELECT * FROM Students WHERE email = 'admin@canteen.com'", (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO Students (id, name, email, password, role, age, grade, class, termGrade, registeredAt)
        VALUES ('admin_1', 'System Admin', 'admin@canteen.com', 'Admin123', 'admin', NULL, NULL, NULL, NULL, ?)
      `, [new Date().toISOString()]);
      console.log('Seeded default admin account.');
    }
  });

  // Check and seed Meals
  db.get("SELECT COUNT(*) as count FROM Meals", (err, row) => {
    if (row && row.count === 0) {
      const defaultMeals = [
        {
          id: 'm1',
          name: 'Classic Beef Burger',
          description: 'Juicy 150g beef patty with cheddar cheese, lettuce, tomato, and our signature sauce.',
          price: 85,
          category: 'burgers',
          rating: 4.8,
          reviews: 124,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify(['Best Seller']),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm2',
          name: 'Double Trouble Burger',
          description: 'Two smashed beef patties, double bacon, caramelized onions, and BBQ sauce.',
          price: 120,
          category: 'burgers',
          rating: 4.9,
          reviews: 89,
          image: './assets/images/double_burger.jpg',
          badges: JSON.stringify(['Popular']),
          isOffer: 1,
          oldPrice: 150,
          discountBadge: '-20%'
        },
        {
          id: 'm3',
          name: 'Margherita Pizza',
          description: 'Classic Italian pizza with fresh mozzarella, San Marzano tomatoes, and basil.',
          price: 110,
          category: 'pizza',
          rating: 4.7,
          reviews: 210,
          image: './assets/images/margherita_pizza.jpg',
          badges: JSON.stringify(['Vegetarian']),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm4',
          name: 'Spicy Pepperoni Pizza',
          description: 'Loaded with premium pepperoni, mozzarella, and hot honey drizzle.',
          price: 135,
          category: 'pizza',
          rating: 4.8,
          reviews: 156,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify(['Popular']),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm5',
          name: 'Crispy Chicken Wrap',
          description: 'Fried chicken strips, lettuce, tomatoes, and ranch dressing in a tortilla.',
          price: 75,
          category: 'sandwiches',
          rating: 4.5,
          reviews: 67,
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify([]),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm6',
          name: 'Grilled Chicken Bowl',
          description: 'Herb-grilled chicken breast served with quinoa, avocado, and roasted veggies.',
          price: 95,
          category: 'chicken',
          rating: 4.9,
          reviews: 42,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify(['New', 'Healthy']),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm7',
          name: 'Truffle Mushroom Pasta',
          description: 'Fettuccine in a creamy truffle sauce with wild mushrooms and parmesan.',
          price: 140,
          category: 'pasta',
          rating: 4.8,
          reviews: 58,
          image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify(['Vegetarian']),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm8',
          name: 'Caesar Salad',
          description: 'Crisp romaine lettuce, croutons, parmesan cheese, and creamy Caesar dressing.',
          price: 65,
          category: 'salads',
          rating: 4.6,
          reviews: 112,
          image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify(['Vegetarian']),
          isOffer: 1,
          oldPrice: 85,
          discountBadge: '-24%'
        },
        {
          id: 'm9',
          name: 'Chocolate Lava Cake',
          description: 'Warm chocolate cake with a gooey molten center, served with vanilla ice cream.',
          price: 55,
          category: 'desserts',
          rating: 4.9,
          reviews: 320,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify(['Best Seller']),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        },
        {
          id: 'm10',
          name: 'Fresh Orange Juice',
          description: 'Freshly squeezed 100% natural orange juice. No added sugar.',
          price: 35,
          category: 'drinks',
          rating: 4.7,
          reviews: 84,
          image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=600&h=400',
          badges: JSON.stringify([]),
          isOffer: 0,
          oldPrice: null,
          discountBadge: null
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO Meals (id, name, description, price, category, rating, reviews, image, badges, isOffer, oldPrice, discountBadge)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      defaultMeals.forEach(m => {
        stmt.run(m.id, m.name, m.description, m.price, m.category, m.rating, m.reviews, m.image, m.badges, m.isOffer, m.oldPrice, m.discountBadge);
      });
      stmt.finalize();
      console.log('Seeded default meals.');
    }
  });

  // Check and seed Dashboard Offers
  db.get("SELECT COUNT(*) as count FROM Offers", (err, row) => {
    if (row && row.count === 0) {
      const defaultOffers = [
        {
          id: 'off1',
          title: 'Burger & Fries Combo',
          description: 'Juicy beef burger + salted french fries + organic juice cup.',
          discount: 'Save 15%',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=250&h=120',
          mealId: 'm2'
        },
        {
          id: 'off2',
          title: 'Garden Fresh Salad Bowl',
          description: 'Organic cherry tomatoes, olives, cucumbers with vinaigrette.',
          discount: 'Healthy',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=250&h=120',
          mealId: 'm8'
        },
        {
          id: 'off3',
          title: 'Honey Berry Yogurt',
          description: 'Greek yogurt topped with local honey and sweet fresh berries.',
          discount: 'Best Seller',
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=250&h=120',
          mealId: 'm9'
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO Offers (id, title, description, discount, image, mealId)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      defaultOffers.forEach(o => {
        stmt.run(o.id, o.title, o.description, o.discount, o.image, o.mealId);
      });
      stmt.finalize();
      console.log('Seeded dashboard offers.');
    }
  });
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, age, grade, class: classVal, termGrade } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  db.get("SELECT id FROM Students WHERE email = ?", [normalizedEmail], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });
    if (row) return res.status(400).json({ success: false, message: 'This email is already registered.' });

    const newId = 'user_' + Date.now();
    db.run(`
      INSERT INTO Students (id, name, email, password, role, age, grade, class, termGrade, registeredAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      name.trim(),
      normalizedEmail,
      password,
      role || 'student',
      role === 'admin' ? null : parseInt(age, 10),
      role === 'admin' ? null : grade,
      role === 'admin' ? null : classVal,
      role === 'admin' ? null : termGrade,
      new Date().toISOString()
    ], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: 'Database error saving user.' });
      res.json({ success: true, message: 'Registration successful! Please log in.' });
    });
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  db.get("SELECT * FROM Students WHERE email = ?", [normalizedEmail], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error.' });
    if (!user) return res.status(400).json({ success: false, message: 'No account found with this email.' });

    if (user.password !== password) {
      return res.status(400).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const sessionUser = { ...user };
    delete sessionUser.password;
    res.json({ success: true, message: 'Welcome back!', user: sessionUser });
  });
});

// Get Meals
app.get('/api/meals', (req, res) => {
  db.all("SELECT * FROM Meals", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mealsList = rows.map(r => ({
      ...r,
      badges: JSON.parse(r.badges || '[]'),
      isOffer: !!r.isOffer
    }));
    res.json(mealsList);
  });
});

// Add Meal (Admin)
app.post('/api/meals', (req, res) => {
  const { name, description, price, category, image } = req.body;
  const newId = 'm_' + Date.now();
  db.run(`
    INSERT INTO Meals (id, name, description, price, category, rating, reviews, image, badges, isOffer, oldPrice, discountBadge)
    VALUES (?, ?, ?, ?, ?, 5.0, 1, ?, '[]', 0, NULL, NULL)
  `, [newId, name, description, parseFloat(price), category, image], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: newId, name, description, price: parseFloat(price), category, rating: 5.0, reviews: 1, image, badges: [], isOffer: false });
  });
});

// Update Meal Price (Admin)
app.put('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  db.get("SELECT * FROM Meals WHERE id = ?", [id], (err, meal) => {
    if (err || !meal) return res.status(404).json({ error: 'Meal not found' });

    const updatedPrice = parseFloat(price);
    let oldPrice = meal.oldPrice;
    if (meal.isOffer && oldPrice) {
      oldPrice = Math.round(updatedPrice * 1.25);
    }

    db.run(`
      UPDATE Meals SET price = ?, oldPrice = ? WHERE id = ?
    `, [updatedPrice, oldPrice, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

// Delete Meal (Admin)
app.delete('/api/meals/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM Meals WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Get Offers
app.get('/api/offers', (req, res) => {
  db.all("SELECT * FROM Offers", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get Orders
app.get('/api/orders', (req, res) => {
  const { userId } = req.query;
  let query = "SELECT * FROM Orders";
  let params = [];
  
  if (userId) {
    query = "SELECT * FROM Orders WHERE userId = ?";
    params = [userId];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const ordersList = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items || '[]')
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(ordersList);
  });
});

// Post Order
app.post('/api/orders', (req, res) => {
  const { userId, items, paymentMethod, subtotal, discount, total } = req.body;
  const newId = 'ord_' + Date.now();
  const date = new Date().toISOString();

  db.run(`
    INSERT INTO Orders (id, userId, date, status, paymentMethod, subtotal, discount, total, items)
    VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?, ?)
  `, [newId, userId, date, paymentMethod, subtotal, discount, total, JSON.stringify(items)], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: newId, userId, date, status: 'Pending', paymentMethod, subtotal, discount, total, items });
  });
});

// Update Order Status (Admin)
app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run("UPDATE Orders SET status = ? WHERE id = ?", [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

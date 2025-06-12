const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();



// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err.message, err.stack);
      return res.status(403).json({ error: 'Invalid token', details: err.message });
    }
    req.user = decoded;
    console.log('Decoded token payload:', decoded); // Debug decoded token
    next();
  });
};

// Get order count
router.get('/orders/count', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.execute('SELECT COUNT(*) as count FROM orders');
    res.json({ count: result[0].count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order count' });
  }
});

// Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute('SELECT id, email, is_admin FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add user
router.post('/users', authenticateToken, async (req, res) => {
  const { email, password, is_admin } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute('INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)', [email, hashedPassword, is_admin]);
    const [newUser] = await db.execute('SELECT id, email, is_admin FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Update user
router.put('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email, is_admin } = req.body;
  try {
    await db.execute('UPDATE users SET email = ?, is_admin = ? WHERE id = ?', [email, is_admin, id]);
    const [updatedUser] = await db.execute('SELECT id, email, is_admin FROM users WHERE id = ?', [id]);
    res.json(updatedUser[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    await db.execute('DELETE FROM cart WHERE user_id = ?', [id]);
    await db.execute('DELETE FROM orders WHERE user_id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products');
    if (products.length === 0) {
      console.log('No products found in database');
      return res.status(404).json({ error: 'No products found' });
    }
    res.json(products);
  } catch (err) {
    console.error('Products fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search products
router.get('/products/search', authenticateToken, async (req, res) => {
  const { q } = req.query;
  try {
    const [products] = await db.execute('SELECT * FROM products WHERE name LIKE ?', [`%${q}%`]);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Add product
router.post('/products', authenticateToken, async (req, res) => {
  const { name, price, image, category } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)',
      [name, price, image, category]
    );
    const [newProduct] = await db.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product
router.put('/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, image, category } = req.body;
  try {
    await db.execute('UPDATE products SET name = ?, price = ?, image = ?, category = ? WHERE id = ?', [name, price, image, category, id]);
    const [updatedProduct] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM products WHERE id = ?', [id]);
    await db.execute('DELETE FROM cart WHERE product_id = ?', [id]);
    await db.execute('DELETE FROM orders WHERE product_id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/orders', authenticateToken, async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id; // Extracted from the token

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items provided for order' });
  }

  try {
    console.log('Processing order for user:', userId, 'with items:', items); // Debug
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    for (const item of items) {
      const [result] = await db.execute(
        'INSERT INTO orders (user_id, product_id, quantity, price, order_date) VALUES (?, ?, ?, ?, ?)',
        [userId, item.product_id, item.quantity, item.price, currentDate]
      );
      console.log('Order inserted:', { insertId: result.insertId, userId, product_id: item.product_id, quantity: item.quantity, price: item.price, order_date: currentDate }); // Debug each insert
    }
    console.log('Order successfully processed for user:', userId); // Debug success
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (err) {
    console.error('Order creation error:', err.message, err.stack); // Detailed error
    res.status(500).json({ error: 'Failed to place order', details: err.message });
  }
});

module.exports = router;
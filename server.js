/**
ENV EXAMPLE :3
PORT=3006
JWT_SECRET=""
DB_PASSWORD=""
JWT_EXPIRATION=3600

 */
const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'SHOP'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(400).json({ message: 'Invalid token.' });
      req.user = decoded;
      console.log(req.user)
      next();
    });
  }
  app.get('/', (req,res) => {
    res.status(200).json({
        status: 200,
        message: 'alloooooooooooooooooo >_<'
    })
  })

  // ========== START AUTH ENDPOINT ================
  app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, hashedPassword], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.status(201).json({ message: 'User registered' });
    });
  });
  
  app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
  
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
      if (err || results.length === 0) return res.status(400).json({ message: 'User not found' });
  
      const validPassword = await bcrypt.compare(password, results[0].password);
      if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: results[0].id, username }, process.env.JWT_SECRET, { expiresIn: Number(process.env.JWT_EXPIRATION) * 1000 });
      res.json({ token });
    });
  });
  // ============= END AUTH ENDPOINT ================

  // ============ START CRUD PRODUK ===================

  // create
  app.post('/products', authenticateToken, (req, res) => {
    const { name, price, category_id } = req.body;
    
    if (isNaN(category_id)) return res.status(400).json({ message: "category_id must be integer" });
    
    const checkCategorySql = 'SELECT id FROM categories WHERE id = ?';
    db.query(checkCategorySql, [category_id], (err, results) => {
      if (err) return res.status(500).json({ loggedAs: req.user.username, message: err.message });
      
      if (results.length === 0) {
        return res.status(400).json({ message: 'category_id tidak valid.' });
      }
      
      const sql = 'INSERT INTO products (name, price, category_id) VALUES (?, ?, ?)';
      db.query(sql, [name, price, category_id], (err, result) => {
        if (err) return res.status(500).json({ loggedAs: req.user.username, message: err.message });
        res.status(201).json({ loggedAs: req.user.username, message: 'product added successfully' });
      });
    });
  });
  
  

  // update 
  app.put('/products/:id', authenticateToken, (req, res) => {
    const { name, price, category_id } = req.body;
    if (isNaN(category_id)) return res.status(400).json({ message: "category_id must be integer" });
    const sql = 'UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?';
    db.query(sql, [name, price, category_id, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ loggedAs: req.user.username, message: err.message });
      res.json({
        status: 200, 
        loggedAs: req.user.username,
        message: 'produk berhasil diupdate', 
      });
    });
  });
  
  // delete
  app.delete('/products/:id', authenticateToken, (req, res) => {
    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
      if (results.length === 0) return res.status(404).json({ 
        status: 404, 
        loggedAs: req.user.username,
        message: "tidak ada produk yang ditemukan berdasarkan id" 
      });
      if (err) return res.status(500).json({ message: err.message });
      res.json({ loggedAs: req.user.username, message: 'produk dihapus' });
    });
  });
  

  // read
  app.get('/products', authenticateToken, (req, res) => {
    const { category_id } = req.query;
    const sql = category_id ? 
      'SELECT * FROM products WHERE category_id = ?' :
      'SELECT * FROM products';
    db.query(sql, [category_id], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (results.length === 0) return res.status(404).json({ 
        status: 404,
        loggedAs: req.user.username,
        message: "tidak ada produk yang ditemukan berdasarkan category_id" 
      });
      results.username = req.user.username
      res.json(results);
    });
  });


  // ============= START CRU CATEGORIES =============

  // create
  app.post('/categories', authenticateToken, (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO categories (name) VALUES (?)';
    
    db.query(sql, [name], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      
      const categoryId = result.insertId;  
      res.status(201).json({ loggedAs: req.user.username, message: 'katagori ditambahkan', category_id: categoryId });
    });
  });
  
  

  // update
  app.put('/categories/:id', authenticateToken, (req, res) => {
    const { name } = req.body;
    const sql = 'UPDATE categories SET name = ? WHERE id = ?';
    db.query(sql, [name, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Category updated' });
    });
  });
  

  // read
  app.get('/categories', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    });
  });

  // ============= START CRUD ORDERS =============
  app.post('/orders', authenticateToken, (req, res) => {
    const { products } = req.body; // { product_id, quantity } order bisa lebih dari satu
    
    products.forEach(product => {
      const sql = 'INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)';
      db.query(sql, [req.user.id, product.product_id, product.quantity], (err) => {
        if (err) return res.status(500).json({ message: err.message });
      });
    });
  
    res.status(201).json({ message: 'Order placed' });
  });
  
  app.get('/orders', authenticateToken, (req, res) => {
    const sql = 'SELECT * FROM orders WHERE user_id = ?';
    db.query(sql, [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    });
  });
  app.listen(3006, () => {
    console.log('Server is running on port 3006');
  });   
  let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});

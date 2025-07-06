const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET todos los usuarios
router.get('/', (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST crear nuevo usuario
router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;
  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: result.insertId, name, email, role });
    }
  );
});

module.exports = router;

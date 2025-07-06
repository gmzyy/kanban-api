const db = require('../config/db');
console.log("✅ userController.js cargado");

// GET: todos los usuarios
exports.getAllUsers = (req, res) => {
  const query = 'SELECT id, name, email, role, created_at FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// POST: crear nuevo usuario
exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, password, role || 'member'], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId, name, email, role });
  });
};

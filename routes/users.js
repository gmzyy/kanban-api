const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { name, email, password, role } = req.body;

  console.log('📥 Datos recibidos en POST /users:', req.body);

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  const values = [name, email, password, role];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('❌ Error al insertar usuario:', err);
      return res.status(500).json({ error: 'Error al insertar usuario' });
    }

    res.status(201).json({
      message: ' Usuario creado correctamente',
      user: {
        id: result.insertId,
        name,
        email,
        role
      }
    });
  });
});

module.exports = router;

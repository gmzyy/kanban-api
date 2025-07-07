const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 🔐 Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'watsibienwatsimal';

router.get('/', (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log('📥 Datos recibidos en POST /users:', req.body);

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const values = [name, email, hashedPassword, role];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('❌ Error al insertar usuario:', err);
        return res.status(500).json({ error: 'Error al insertar usuario' });
      }

      res.status(201).json({
        message: '✅ Usuario creado correctamente',
        user: {
          id: result.insertId,
          name,
          email,
          role
        }
      });
    });
  } catch (err) {
    console.error('❌ Error al hashear la contraseña:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Se requieren email y password' });
  }

  const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('❌ Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: ' Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

module.exports = router;

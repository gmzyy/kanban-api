// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'watsibienwatsimal';

/* ------------------ Auth middleware ------------------ */
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
function canModifyUser(req, targetUserId) {
  const isSelf = Number(req.user?.id) === Number(targetUserId);
  const isAdmin = req.user?.role === 'owner' || req.user?.role === 'admin';
  return isSelf || isAdmin;
}

/* ------------------ LISTAR ------------------ */
router.get('/', (req, res) => {
  db.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) {
      console.error(' Error al obtener usuarios:', err);
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(results);
  });
});

/* ------------------ CREAR (admin/manual) ------------------ */
router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log(' Datos recibidos en POST /users:', req.body);

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(' Error al verificar el email:', err);
        return res.status(500).json({ error: 'Error al verificar el email' });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      const values = [name, email, hashedPassword, role];

      db.query(query, values, (err2, result) => {
        if (err2) {
          console.error(' Error al insertar usuario:', err2);
          return res.status(500).json({ error: 'Error al insertar usuario' });
        }
        res.status(201).json({
          message: 'Usuario creado correctamente',
          user: { id: result.insertId, name, email, role }
        });
      });
    });
  } catch (err) {
    console.error('Error al hashear la contraseña:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/* ------------------ REGISTER (self-service) ------------------ */
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body; // role por defecto = 'member'
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error(' Error al verificar el email:', err);
        return res.status(500).json({ error: 'Error al verificar el email' });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      const hashed = await bcrypt.hash(password, 10);
      const insert = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      db.query(insert, [name, email, hashed, 'member'], (err2, result) => {
        if (err2) {
          console.error(' Error al registrar usuario:', err2);
          return res.status(500).json({ error: 'Error registrando usuario' });
        }

        const payload = { id: result.insertId, email, role: 'member' };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });

        res.status(201).json({
          message: '✅ Registro exitoso',
          token,
          user: { id: result.insertId, name, email, role: 'member' }
        });
      });
    });
  } catch (e) {
    console.error(' Error en /register:', e);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/* ------------------ LOGIN ------------------ */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Se requieren email y password' });

  const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error(' Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    if (results.length === 0)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      message: '✅ Login exitoso',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

/* ------------------ AUTH: quién soy ------------------ */
router.get('/auth/me', auth, (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error obteniendo perfil' });
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  });
});

/* ------------------ MOSTRAR PERFIL ------------------ */
router.get('/:id', auth, (req, res) => {
  const { id } = req.params;
  if (!canModifyUser(req, id)) return res.status(403).json({ error: 'No autorizado' });

  const q = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
  db.query(q, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error obteniendo usuario' });
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  });
});

/* ------------------ EDITAR PERFIL ------------------ */
router.put('/:id', auth, (req, res) => {
  const { id } = req.params;
  if (!canModifyUser(req, id)) return res.status(403).json({ error: 'No autorizado' });

  const { name, email, role } = req.body;
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (email !== undefined) { fields.push('email = ?'); params.push(email); }
  if (role !== undefined) { fields.push('role = ?'); params.push(role); }

  if (fields.length === 0) return res.status(400).json({ error: 'Nada para actualizar' });

  const checkEmail = (cb) => {
    if (email === undefined) return cb();
    db.query('SELECT id FROM users WHERE email = ? AND id <> ?', [email, id], (e, r) => {
      if (e) return res.status(500).json({ error: 'Error verificando email' });
      if (r.length > 0) return res.status(409).json({ error: 'El email ya existe' });
      cb();
    });
  };

  checkEmail(() => {
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    params.push(id);
    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error actualizando usuario' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

      db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id], (e2, rows) => {
        if (e2) return res.status(500).json({ error: 'Error consultando usuario' });
        res.json(rows[0]);
      });
    });
  });
});

/* ------------------ CAMBIAR CONTRASEÑA ------------------ */
router.patch('/:id/password', auth, async (req, res) => {
  const { id } = req.params;
  if (!canModifyUser(req, id)) return res.status(403).json({ error: 'No autorizado' });

  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password es requerido' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error actualizando contraseña' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json({ message: 'Contraseña actualizada' });
    });
  } catch (e) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/* ------------------ ELIMINAR USUARIO ------------------ */
router.delete('/:id', auth, (req, res) => {
  const { id } = req.params;
  if (!canModifyUser(req, id)) return res.status(403).json({ error: 'No autorizado' });

  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error eliminando usuario' });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  });
});

module.exports = router;

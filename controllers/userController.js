const db = require('../config/db');
console.log("✅ userController.js cargado");

// =============== LISTAR ===============
exports.getAllUsers = (req, res) => {
  const query = 'SELECT id, name, email, role, created_at FROM users';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
};

// =============== CREAR ===============
exports.createUser = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  // (Sugerencia: hashea password con bcrypt en producción)
  const query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
  db.query(query, [name, email, password, role || 'member'], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El email ya existe' });
      }
      return res.status(500).send(err);
    }
    res.status(201).json({ id: result.insertId, name, email, role: role || 'member' });
  });
};

// =============== OBTENER POR ID (MOSTRAR PERFIL) ===============
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const query = 'SELECT id, name, email, role, created_at FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(results[0]);
  });
};

// =============== ACTUALIZAR PERFIL (nombre, email, role) ===============
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  // Construcción dinámica de SET para actualizar solo lo enviado
  const fields = [];
  const params = [];
  if (name !== undefined) { fields.push('name = ?'); params.push(name); }
  if (email !== undefined) { fields.push('email = ?'); params.push(email); }
  if (role !== undefined) { fields.push('role = ?'); params.push(role); }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'Nada para actualizar' });
  }

  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'El email ya existe' });
      }
      return res.status(500).send(err);
    }
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id], (err2, rows) => {
      if (err2) return res.status(500).send(err2);
      res.json(rows[0]);
    });
  });
};

// =============== CAMBIAR CONTRASEÑA ===============
exports.updateUserPassword = (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'password es requerido' });

  // (Producción: validar contraseña, hashear con bcrypt)
  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  db.query(sql, [password, id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Contraseña actualizada' });
  });
};

// =============== ELIMINAR ===============
exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  });
};

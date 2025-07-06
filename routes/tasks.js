const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/tasks → crear tarea
router.post('/', (req, res) => {
  const { title, description, priority, column_id, created_by } = req.body;

  if (!title || !column_id || !created_by) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  db.query(
    'INSERT INTO tasks (title, description, priority, column_id, created_by) VALUES (?, ?, ?, ?, ?)',
    [title, description, priority, column_id, created_by],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: result.insertId, title });
    }
  );
});

// GET /api/tasks?column_id=1 → obtener tareas de una columna
router.get('/', (req, res) => {
  const { column_id } = req.query;

  if (!column_id) {
    return res.status(400).json({ error: 'Se requiere column_id' });
  }

  db.query(
    'SELECT * FROM tasks WHERE column_id = ?',
    [column_id],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

module.exports = router;

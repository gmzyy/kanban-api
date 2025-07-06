const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/columns → crear columna
router.post('/', (req, res) => {
  const { name, position } = req.body;

  if (!name || typeof position !== 'number') {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  db.query(
    'INSERT INTO columns (name, position) VALUES (?, ?)',
    [name, position],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: result.insertId, name, position });
    }
  );
});

// GET /api/columns → listar columnas
router.get('/', (req, res) => {
  db.query('SELECT * FROM columns ORDER BY position', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ======================================================
// POST /api/columns/:projectId  → Crear columna en un proyecto
// ======================================================
router.post('/:projectId', (req, res) => {
  const { projectId } = req.params;
  const { name, position } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  // Insertar la columna asociada al proyecto
  const query = 'INSERT INTO columns (name, position, project_id) VALUES (?, ?, ?)';
  db.query(query, [name, position || 1, projectId], (err, result) => {
    if (err) {
      console.error('Error al crear columna:', err);
      return res.status(500).json({ error: 'Error al crear columna' });
    }

    res.status(201).json({
      message: 'Columna creada correctamente',
      column: {
        id: result.insertId,
        name,
        position: position || 1,
        project_id: projectId
      }
    });
  });
});

// ======================================================
// GET /api/columns/:projectId → Listar columnas de un proyecto
// ======================================================
router.get('/:projectId', (req, res) => {
  const { projectId } = req.params;

  const query = 'SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC';
  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error('Error al obtener columnas:', err);
      return res.status(500).json({ error: 'Error al obtener columnas' });
    }

    res.json(results);
  });
});

// ======================================================
// PUT /api/columns/:id → Editar columna por id
// ======================================================
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, position } = req.body;

  const query = 'UPDATE columns SET name = ?, position = ? WHERE id = ?';
  db.query(query, [name, position, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar columna:', err);
      return res.status(500).json({ error: 'Error al actualizar columna' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Columna no encontrada' });
    }

    res.json({ message: 'Columna actualizada correctamente' });
  });
});

// ======================================================
// DELETE /api/columns/:id → Eliminar columna
// ======================================================
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM columns WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar columna:', err);
      return res.status(500).json({ error: 'Error al eliminar columna' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Columna no encontrada' });
    }

    res.json({ message: 'Columna eliminada correctamente' });
  });
});

module.exports = router;

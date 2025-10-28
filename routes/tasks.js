const express = require('express');
const router = express.Router();
const db = require('../config/db');
const conn = () => db.promise();

/* Crear tarea dentro de una columna
   POST /api/tasks/by-column/:columnId */
router.post('/by-column/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, description, priority, created_by } = req.body;

    if (!title) return res.status(400).json({ error: 'El título es obligatorio' });

    // Verifica columna
    const [col] = await conn().query('SELECT id FROM columns WHERE id = ?', [columnId]);
    if (col.length === 0) return res.status(404).json({ error: 'Columna no encontrada' });

    const sql = `
      INSERT INTO tasks (title, description, priority, column_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    const prio = priority || 'medium';

    const [result] = await conn().query(sql, [
      title,
      description || null,
      prio,
      Number(columnId),
      created_by || null
    ]);

    const [rows] = await conn().query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: '✅ Tarea creada correctamente', task: rows[0] });
  } catch (err) {
    console.error('❌ Error al crear tarea:', err);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

/* Obtener tareas por columna
   GET /api/tasks/by-column/:columnId */
router.get('/by-column/:columnId', async (req, res) => {
  try {
    const { columnId } = req.params;
    const [rows] = await conn().query(
      'SELECT * FROM tasks WHERE column_id = ? ORDER BY created_at ASC',
      [columnId]
    );
    res.json(rows);
  } catch (err) {
    console.error('❌ Error al obtener tareas:', err);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

/* (Opcional) Obtener una tarea por id  GET /api/tasks/:id */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await conn().query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener tarea:', err);
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
});

/* Actualizar tarea  PUT /api/tasks/:id */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, column_id } = req.body;

    const sets = [];
    const params = [];
    if (title !== undefined)       { sets.push('title = ?');       params.push(title); }
    if (description !== undefined) { sets.push('description = ?'); params.push(description); }
    if (priority !== undefined)    { sets.push('priority = ?');    params.push(priority); }
    if (column_id !== undefined)   { sets.push('column_id = ?');   params.push(column_id); }

    if (sets.length === 0) return res.status(400).json({ error: 'Nada para actualizar' });

    const [r] = await conn().query(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });

    const [rows] = await conn().query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar tarea:', err);
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

/* Eliminar tarea  DELETE /api/tasks/:id */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await conn().query('DELETE FROM tasks WHERE id = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar tarea:', err);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

module.exports = router;

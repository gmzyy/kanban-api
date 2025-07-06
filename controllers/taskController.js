const db = require('../config/db');

exports.createTask = async (req, res) => {
  const { title, description, priority, column_id, created_by } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO tasks (title, description, priority, column_id, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, priority, column_id, created_by]
    );
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
};

exports.getTasksByColumn = async (req, res) => {
  const columnId = req.query.column_id;
  try {
    const [rows] = await db.query(
      `SELECT * FROM tasks WHERE column_id = ? ORDER BY created_at DESC`,
      [columnId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
};

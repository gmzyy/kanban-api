const db = require('../config/db');
const getConn = () => db.promise();

/* ================================
   Crear tarea dentro de una columna
   POST /api/columns/:columnId/tasks
================================ */
exports.createTaskInColumn = async (req, res) => {
  try {
    const { columnId } = req.params; // <-- viene de la URL
    const { title, description, priority, created_by } = req.body;

    if (!title) return res.status(400).json({ message: 'El título es obligatorio' });

    // Verifica que la columna exista
    const [col] = await getConn().query('SELECT id FROM columns WHERE id = ?', [columnId]);
    if (col.length === 0) return res.status(404).json({ message: 'Columna no encontrada' });

    // Inserta la tarea en esa columna
    const sql = `
      INSERT INTO tasks (title, description, priority, column_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await getConn().query(sql, [
      title,
      description || null,
      priority || 'medium',
      columnId,
      created_by || null
    ]);

    res.status(201).json({
      message: 'Tarea creada correctamente',
      task: {
        id: result.insertId,
        title,
        description,
        priority: priority || 'medium',
        column_id: Number(columnId),
        created_by: created_by || null
      }
    });
  } catch (err) {
    console.error('createTaskInColumn error:', err);
    res.status(500).json({ message: 'Error creando tarea' });
  }
};

/* ================================
   Obtener tareas de una columna
   GET /api/columns/:columnId/tasks
================================ */
exports.getTasksByColumn = async (req, res) => {
  try {
    const { columnId } = req.params; // <-- ahora se obtiene de la URL

    const [rows] = await getConn().query(
      'SELECT * FROM tasks WHERE column_id = ? ORDER BY created_at DESC',
      [columnId]
    );

    res.json(rows);
  } catch (err) {
    console.error('getTasksByColumn error:', err);
    res.status(500).json({ message: 'Error al obtener tareas' });
  }
};

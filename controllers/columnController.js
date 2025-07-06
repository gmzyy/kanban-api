const db = require('../config/db');

exports.createColumn = async (req, res) => {
  const { name, position } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO columns (name, position) VALUES (?, ?)',
      [name, position]
    );
    res.status(201).json({ id: result.insertId, name, position });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear columna' });
  }
};

exports.getColumns = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM columns ORDER BY position');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener columnas' });
  }
};

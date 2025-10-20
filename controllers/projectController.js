// controllers/projectController.js
const db = require('../config/db');

// Helpers
const getConn = () => db.promise();

exports.createProject = async (req, res) => {
  try {
    const { name, description = null, created_by = null } = req.body;
    if (!name) return res.status(400).json({ message: 'name es requerido' });

    const sql = `
      INSERT INTO projects (name, description, created_by)
      VALUES (?, ?, ?)
    `;
    const [result] = await getConn().query(sql, [name, description, created_by]);
    const [rows] = await getConn().query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createProject error:', err);
    res.status(500).json({ message: 'Error creando proyecto' });
  }
};

exports.getProjects = async (_req, res) => {
  try {
    const [rows] = await getConn().query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('getProjects error:', err);
    res.status(500).json({ message: 'Error listando proyectos' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await getConn().query('SELECT * FROM projects WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getProjectById error:', err);
    res.status(500).json({ message: 'Error obteniendo proyecto' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Parcial: solo actualiza campos enviados
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (fields.length === 0) return res.status(400).json({ message: 'Nada para actualizar' });

    const sql = `UPDATE projects SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params.push(id);

    const [result] = await getConn().query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });

    const [rows] = await getConn().query('SELECT * FROM projects WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateProject error:', err);
    res.status(500).json({ message: 'Error actualizando proyecto' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    // Nota: project_members y columns tienen ON DELETE CASCADE si seguiste mi SQL
    const [result] = await getConn().query('DELETE FROM projects WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Proyecto no encontrado' });
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    console.error('deleteProject error:', err);
    res.status(500).json({ message: 'Error eliminando proyecto' });
  }
};

/* ------- MEMBERS (colaboradores del proyecto) ------- */

exports.getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params; // project_id
    const sql = `
      SELECT pm.project_id, pm.user_id, pm.role, pm.added_at, u.name, u.email
      FROM project_members pm
      JOIN users u ON u.id = pm.user_id
      WHERE pm.project_id = ?
      ORDER BY u.name
    `;
    const [rows] = await getConn().query(sql, [id]);
    res.json(rows);
  } catch (err) {
    console.error('getProjectMembers error:', err);
    res.status(500).json({ message: 'Error listando miembros' });
  }
};

exports.addProjectMember = async (req, res) => {
  try {
    const { id } = req.params; // project_id
    const { user_id, role = 'member' } = req.body;
    if (!user_id) return res.status(400).json({ message: 'user_id es requerido' });

    const sql = `
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE role = VALUES(role)
    `;
    await getConn().query(sql, [id, user_id, role]);

    const [rows] = await getConn().query(
      `SELECT pm.project_id, pm.user_id, pm.role, pm.added_at, u.name, u.email
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ? AND pm.user_id = ?`,
      [id, user_id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('addProjectMember error:', err);
    res.status(500).json({ message: 'Error agregando miembro' });
  }
};

exports.updateProjectMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params; // project_id, user_id
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role es requerido' });

    const [result] = await getConn().query(
      'UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?',
      [role, id, userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Miembro no encontrado' });

    const [rows] = await getConn().query(
      `SELECT pm.project_id, pm.user_id, pm.role, pm.added_at, u.name, u.email
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = ? AND pm.user_id = ?`,
      [id, userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('updateProjectMemberRole error:', err);
    res.status(500).json({ message: 'Error actualizando rol' });
  }
};

exports.removeProjectMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const [result] = await getConn().query(
      'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Miembro no encontrado' });
    res.json({ message: 'Miembro eliminado' });
  } catch (err) {
    console.error('removeProjectMember error:', err);
    res.status(500).json({ message: 'Error eliminando miembro' });
  }
};

/* ------- (Opcional) Columns del proyecto ------- */
exports.getProjectColumns = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await getConn().query(
      'SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC, id ASC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('getProjectColumns error:', err);
    res.status(500).json({ message: 'Error listando columnas del proyecto' });
  }
};

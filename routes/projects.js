// routes/projects.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectController');

// CRUD projects
router.post('/', controller.createProject);        // Crear proyecto
router.get('/', controller.getProjects);           // Listar proyectos
router.get('/:id', controller.getProjectById);     // Obtener proyecto por id
router.put('/:id', controller.updateProject);      // Actualizar (parcial o total)
router.delete('/:id', controller.deleteProject);   // Borrar proyecto

// Members
router.get('/:id/members', controller.getProjectMembers);                 // Listar miembros
router.post('/:id/members', controller.addProjectMember);                 // Agregar/actualizar rol
router.patch('/:id/members/:userId', controller.updateProjectMemberRole); // Cambiar rol
router.delete('/:id/members/:userId', controller.removeProjectMember);    // Eliminar miembro

// Columns del proyecto (opcional pero útil)
router.get('/:id/columns', controller.getProjectColumns);

module.exports = router;

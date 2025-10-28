// routes/projects.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectController');

// CRUD projects
router.post('/', controller.createProject);            // ✅ sin paréntesis
router.get('/', controller.getProjects);
router.get('/:id', controller.getProjectById);
router.put('/:id', controller.updateProject);
router.delete('/:id', controller.deleteProject);

// Members
router.get('/:id/members', controller.getProjectMembers);
router.post('/:id/members', controller.addProjectMember);
router.patch('/:id/members/:userId', controller.updateProjectMemberRole);
router.delete('/:id/members/:userId', controller.removeProjectMember);

// Columns dentro del proyecto
router.get('/:id/columns', controller.getProjectColumns);
router.post('/:id/columns', controller.createProjectColumn);
router.put('/:id/columns/:columnId', controller.updateProjectColumn);
router.delete('/:id/columns/:columnId', controller.deleteProjectColumn);

module.exports = router; // ✅ EXPORTA EL ROUTER

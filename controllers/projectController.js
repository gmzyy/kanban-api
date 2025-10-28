// controllers/projectController.js
const db = require('../config/db');
const getConn = () => db.promise();

exports.createProject = async (req, res) => { /* ... */ };
exports.getProjects = async (req, res) => { /* ... */ };
exports.getProjectById = async (req, res) => { /* ... */ };
exports.updateProject = async (req, res) => { /* ... */ };
exports.deleteProject = async (req, res) => { /* ... */ };

exports.getProjectMembers = async (req, res) => { /* ... */ };
exports.addProjectMember = async (req, res) => { /* ... */ };
exports.updateProjectMemberRole = async (req, res) => { /* ... */ };
exports.removeProjectMember = async (req, res) => { /* ... */ };

exports.getProjectColumns = async (req, res) => { /* ... */ };
exports.createProjectColumn = async (req, res) => { /* ... */ };
exports.updateProjectColumn = async (req, res) => { /* ... */ };
exports.deleteProjectColumn = async (req, res) => { /* ... */ };

const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const { protect, isAdmin } = require('../middleware/auth');

// All routes require login
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(isAdmin, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(isAdmin, updateProject)
  .delete(isAdmin, deleteProject);

router.route('/:id/members')
  .post(isAdmin, addMember);

router.route('/:id/members/:userId')
  .delete(isAdmin, removeMember);

module.exports = router;
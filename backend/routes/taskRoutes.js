const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  getOverdueTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getDashboardStats
} = require('../controllers/taskController');
const { protect, isAdmin } = require('../middleware/auth');

router.use(protect);

router.get('/my', getMyTasks);
router.get('/overdue', getOverdueTasks);
router.get('/dashboard', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(isAdmin, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(isAdmin, updateTask)
  .delete(isAdmin, deleteTask);

router.patch('/:id/status', updateTaskStatus);

module.exports = router;
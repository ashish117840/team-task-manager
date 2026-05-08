const Task = require('../models/Task');
const Project = require('../models/Project');
const { isValidFutureOrTodayDate, isValidObjectId } = require('../utils/validation');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// Helper — check if user belongs to project
const isProjectMember = (project, userId) => {
  return project.members.some(m => {
    const memberId = m._id || m;
    return memberId.toString() === userId.toString();
  });
};

// @POST /api/tasks — Admin creates & assigns task
const createTask = async (req, res) => {
  try {
    const { projectId, assignedTo, priority, dueDate } = req.body;
    const title = req.body.title?.trim();
    const description = req.body.description?.trim() || '';

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: 'Invalid assigned user id' });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    if (!isValidFutureOrTodayDate(dueDate)) {
      return res.status(400).json({ message: 'Due date must be today or later' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner (admin) can create tasks
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can create tasks' });
    }

    // If assigning to someone, check they are a project member
    if (assignedTo) {
      const isMember = isProjectMember(project, assignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority,
      dueDate
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'project', select: 'name' }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks?projectId=xxx — Get all tasks for a project
const getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: 'projectId query param is required' });
    }

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Must be a member or owner
    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      isProjectMember(project, req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build filter
    const filter = { project: projectId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks/my — Get tasks assigned to logged-in user
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks/overdue — Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    const filter = {
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    };

    filter[req.user.role === 'admin' ? 'createdBy' : 'assignedTo'] = req.user._id;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks/:id — Get single task
const getTaskById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name members owner');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;
    const hasAccess =
      project.owner.toString() === req.user._id.toString() ||
      isProjectMember(project, req.user._id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/tasks/:id — Admin updates full task
const updateTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can update tasks' });
    }

    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    const trimmedTitle = title?.trim();

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority value' });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (!isValidFutureOrTodayDate(dueDate)) {
      return res.status(400).json({ message: 'Due date must be today or later' });
    }

    task.title = trimmedTitle || task.title;
    task.description = description?.trim() ?? task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate ?? task.dueDate;
    task.status = status || task.status;

    if (assignedTo) {
      if (!isValidObjectId(assignedTo)) {
        return res.status(400).json({ message: 'Invalid assigned user id' });
      }

      const isMember = isProjectMember(task.project, assignedTo);
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user is not a project member' });
      }
      task.assignedTo = assignedTo;
    }

    const updated = await task.save();
    await updated.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PATCH /api/tasks/:id/status — Member updates own task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the assigned user or project owner can update status.
    const isAssigned = task.assignedTo?.toString() === req.user._id.toString();
    const isProjectOwner = task.project.owner.toString() === req.user._id.toString();

    if (!isAssigned && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.json({ message: 'Status updated', task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/tasks/:id — Admin deletes task
const deleteTask = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks/dashboard — Dashboard stats for logged-in user
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    let taskFilter = {};
    if (req.user.role !== 'admin') {
      taskFilter.assignedTo = userId;
    } else {
      taskFilter.createdBy = userId;
    }

    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'todo' }),
      Task.countDocuments({ ...taskFilter, status: 'in-progress' }),
      Task.countDocuments({ ...taskFilter, status: 'done' }),
      Task.countDocuments({ ...taskFilter, dueDate: { $lt: now }, status: { $ne: 'done' } })
    ]);

    res.json({ total, todo, inProgress, done, overdue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  getMyTasks,
  getOverdueTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getDashboardStats
};

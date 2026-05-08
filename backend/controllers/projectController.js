const Project = require('../models/Project');
const User = require('../models/User');
const { isValidEmail, isValidObjectId } = require('../utils/validation');

// @POST /api/projects — Admin creates project
const createProject = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const description = req.body.description?.trim() || '';

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    if (name.length > 80) {
      return res.status(400).json({ message: 'Project name must be 80 characters or less' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id] // owner is also a member
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/projects — Get all projects for logged-in user
const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'admin') {
      // Admin sees all projects they own
      projects = await Project.find({ owner: req.user._id })
        .populate('owner', 'name email')
        .populate('members', 'name email role');
    } else {
      // Member sees projects they are part of
      projects = await Project.find({ members: req.user._id })
        .populate('owner', 'name email')
        .populate('members', 'name email role');
    }

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/projects/:id — Get single project
const getProjectById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is a member. Owners are added to members on creation.
    const isMember = project.members.some(
      m => m._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/projects/:id — Admin updates project
const updateProject = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can update' });
    }

    const name = req.body.name?.trim();
    if (name?.length > 80) {
      return res.status(400).json({ message: 'Project name must be 80 characters or less' });
    }

    project.name = name || project.name;
    project.description = req.body.description?.trim() ?? project.description;

    const updated = await project.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/projects/:id — Admin deletes project
const deleteProject = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can delete' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/projects/:id/members — Admin adds member by email
const addMember = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: 'Member email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid member email' });
    }

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    const alreadyMember = project.members.some(
      m => m.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    const updated = await Project.findById(req.params.id)
      .populate('members', 'name email role');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/projects/:id/members/:userId — Admin removes member
const removeMember = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid project or member id' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only project owner can remove members' });
    }

    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter(
      m => m.toString() !== req.params.userId
    );

    await project.save();
    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};

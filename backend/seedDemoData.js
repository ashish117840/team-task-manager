require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

dns.setServers(['8.8.8.8', '1.1.1.1']);

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment.');
  process.exit(1);
}

const DEMO_ADMIN = {
  name: 'Ashish Kumar',
  email: 'helloashish20@gmail.com',
  password: 'Ashish@7000',
  role: 'admin'
};

const DEMO_MEMBERS = [
  { name: 'Aarav Singh', email: 'aarav.member@taskmanager.local', password: 'TMdemo-2026!', role: 'member' },
  { name: 'Siya Verma', email: 'siya.member@taskmanager.local', password: 'TMdemo-2026!', role: 'member' },
  { name: 'Vivaan Patel', email: 'vivaan.member@taskmanager.local', password: 'TMdemo-2026!', role: 'member' },
  { name: 'Anaya Sharma', email: 'anaya.member@taskmanager.local', password: 'TMdemo-2026!', role: 'member' }
];

const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
};

const makeProjectData = (adminId, members) => {
  const [m1, m2, m3, m4] = members;

  return [
    {
      name: 'Client Portal Rebuild',
      description: 'Refine the customer portal, streamline task handoff, and finish mobile-first updates.',
      owner: adminId,
      members: [m1._id, m2._id, m3._id],
      tasks: [
        { title: 'Draft portal homepage layout', description: 'Map header, shortcuts, and quick-task actions', assignedTo: m1._id, priority: 'high', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Tighten task status labels', description: 'Make the workflow names easier for members to follow', assignedTo: m2._id, priority: 'medium', status: 'todo', dueDate: addDays(4) },
        { title: 'Check tablet spacing rules', description: 'Confirm the layout holds on mid-size screens', assignedTo: m3._id, priority: 'low', status: 'todo', dueDate: addDays(6) }
      ]
    },
    {
      name: 'Mobile Release Board',
      description: 'Track the final fixes, review notes, and prep the next app release.',
      owner: adminId,
      members: [m1._id, m3._id, m4._id],
      tasks: [
        { title: 'Fix profile save regression', description: 'Patch the Android payload issue before release', assignedTo: m4._id, priority: 'high', status: 'in-progress', dueDate: addDays(1) },
        { title: 'Publish release summary', description: 'Explain the changes in plain language for users', assignedTo: m1._id, priority: 'medium', status: 'done', dueDate: addDays(-1) },
        { title: 'Test login and task sync', description: 'Run a quick pass on the core workflow after deployment', assignedTo: m3._id, priority: 'high', status: 'todo', dueDate: addDays(3) }
      ]
    },
    {
      name: 'Growth Campaign Calendar',
      description: 'Plan the content sequence and keep all launch assets aligned.',
      owner: adminId,
      members: [m2._id, m3._id],
      tasks: [
        { title: 'Build weekly content grid', description: 'Set the rollout for social, email, and banner posts', assignedTo: m2._id, priority: 'medium', status: 'done', dueDate: addDays(-2) },
        { title: 'Create ad concept variants', description: 'Prepare multiple options for the main campaign push', assignedTo: m3._id, priority: 'high', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Clean up email groups', description: 'Remove stale contacts before the next send', assignedTo: m2._id, priority: 'low', status: 'todo', dueDate: addDays(5) }
      ]
    },
    {
      name: 'Support Desk Upgrade',
      description: 'Improve response quality, reduce turnaround time, and standardize support handoffs.',
      owner: adminId,
      members: [m1._id, m2._id, m4._id],
      tasks: [
        { title: 'Write canned support replies', description: 'Draft reusable responses for the common ticket types', assignedTo: m4._id, priority: 'medium', status: 'todo', dueDate: addDays(4) },
        { title: 'Set escalation rules', description: 'Clarify who handles urgent or blocked requests', assignedTo: m1._id, priority: 'high', status: 'in-progress', dueDate: addDays(1) },
        { title: 'Measure response baseline', description: 'Capture average reply time and resolution time', assignedTo: m2._id, priority: 'low', status: 'done', dueDate: addDays(-3) }
      ]
    },
    {
      name: 'Migration Prep Room',
      description: 'Move the old records into the new structure with checks and rollback safety.',
      owner: adminId,
      members: [m3._id, m4._id],
      tasks: [
        { title: 'Map field translations', description: 'Document how each old field maps to the new model', assignedTo: m3._id, priority: 'high', status: 'done', dueDate: addDays(-4) },
        { title: 'Script the dry run', description: 'Test the migration flow before touching live data', assignedTo: m4._id, priority: 'high', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Validate sample records', description: 'Check a small batch for consistency after the move', assignedTo: m3._id, priority: 'medium', status: 'todo', dueDate: addDays(5) }
      ]
    },
    {
      name: 'Security Review Board',
      description: 'Review access controls, credentials, and dependency risks before the next release.',
      owner: adminId,
      members: [m1._id, m2._id, m4._id],
      tasks: [
        { title: 'Rotate shared secrets', description: 'Replace old credentials and update the secure store', assignedTo: m1._id, priority: 'high', status: 'todo', dueDate: addDays(3) },
        { title: 'Scan packages for CVEs', description: 'Check the dependency tree for urgent issues', assignedTo: m4._id, priority: 'medium', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Confirm role boundaries', description: 'Review admin and member permissions before release', assignedTo: m2._id, priority: 'high', status: 'done', dueDate: addDays(-1) }
      ]
    }
  ];
};

const upsertUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (existing) {
    existing.name = name;
    existing.role = role;
    existing.password = hashedPassword;
    await existing.save();
    return existing;
  }

  return User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    role
  });
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const admin = await upsertUser(DEMO_ADMIN);
  const members = [];
  for (const memberData of DEMO_MEMBERS) {
    members.push(await upsertUser(memberData));
  }

  const projectData = makeProjectData(admin._id, members);

  let createdProjects = 0;
  let createdTasks = 0;

  for (const projectSeed of projectData) {
    let project = await Project.findOne({ name: projectSeed.name, owner: admin._id });

    if (!project) {
      project = await Project.create({
        name: projectSeed.name,
        description: projectSeed.description,
        owner: admin._id,
        members: projectSeed.members
      });
      createdProjects += 1;
    }

    for (const taskSeed of projectSeed.tasks) {
      const exists = await Task.findOne({
        title: taskSeed.title,
        project: project._id
      });

      if (!exists) {
        await Task.create({
          ...taskSeed,
          project: project._id,
          createdBy: admin._id
        });
        createdTasks += 1;
      }
    }
  }

  console.log('Demo data seeded successfully.');
  console.log(`Projects created: ${createdProjects}`);
  console.log(`Tasks created: ${createdTasks}`);
  console.log('Demo credentials:');
  console.log(`Admin:  ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
  console.log(`Member: ${DEMO_MEMBERS[0].email} / ${DEMO_MEMBERS[0].password}`);
};

seed()
  .catch((err) => {
    console.error('Failed to seed demo data:', err.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

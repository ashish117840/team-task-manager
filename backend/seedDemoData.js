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
  { name: 'Aarav Singh', email: 'aarav.member@taskmanager.local', password: 'DemoPass123!', role: 'member' },
  { name: 'Siya Verma', email: 'siya.member@taskmanager.local', password: 'DemoPass123!', role: 'member' },
  { name: 'Vivaan Patel', email: 'vivaan.member@taskmanager.local', password: 'DemoPass123!', role: 'member' },
  { name: 'Anaya Sharma', email: 'anaya.member@taskmanager.local', password: 'DemoPass123!', role: 'member' }
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
      name: 'Website Redesign Sprint',
      description: 'Refresh landing pages, improve conversion flow, and ship responsive updates.',
      owner: adminId,
      members: [m1._id, m2._id, m3._id],
      tasks: [
        { title: 'Define new homepage wireframe', description: 'Draft hero, value props, CTA hierarchy', assignedTo: m1._id, priority: 'high', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Audit existing UI copy', description: 'Rewrite confusing labels and microcopy', assignedTo: m2._id, priority: 'medium', status: 'todo', dueDate: addDays(4) },
        { title: 'Responsive QA for tablet layouts', description: 'Validate spacing and typography on 768-1024px', assignedTo: m3._id, priority: 'low', status: 'todo', dueDate: addDays(6) }
      ]
    },
    {
      name: 'Mobile App Release v2.1',
      description: 'Finalize release scope for reliability fixes and push to production.',
      owner: adminId,
      members: [m1._id, m3._id, m4._id],
      tasks: [
        { title: 'Fix crash on profile save', description: 'Resolve null payload edge-case on Android', assignedTo: m4._id, priority: 'high', status: 'in-progress', dueDate: addDays(1) },
        { title: 'Update release notes', description: 'Summarize bug fixes and user-facing changes', assignedTo: m1._id, priority: 'medium', status: 'done', dueDate: addDays(-1) },
        { title: 'Smoke test checkout flow', description: 'Run happy path + payment retry scenarios', assignedTo: m3._id, priority: 'high', status: 'todo', dueDate: addDays(3) }
      ]
    },
    {
      name: 'Marketing Campaign Q3',
      description: 'Plan and execute Q3 social, email, and paid media campaign timeline.',
      owner: adminId,
      members: [m2._id, m3._id],
      tasks: [
        { title: 'Create campaign calendar', description: 'Schedule weekly content pillars for 8 weeks', assignedTo: m2._id, priority: 'medium', status: 'done', dueDate: addDays(-2) },
        { title: 'Design ad variants', description: 'Produce 6 creatives for A/B testing', assignedTo: m3._id, priority: 'high', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Email segment cleanup', description: 'Remove bounced contacts and stale segments', assignedTo: m2._id, priority: 'low', status: 'todo', dueDate: addDays(5) }
      ]
    },
    {
      name: 'Customer Support Revamp',
      description: 'Improve helpdesk response quality and reduce first-response time.',
      owner: adminId,
      members: [m1._id, m2._id, m4._id],
      tasks: [
        { title: 'Draft support macros', description: 'Prepare 15 standard responses for common tickets', assignedTo: m4._id, priority: 'medium', status: 'todo', dueDate: addDays(4) },
        { title: 'Escalation matrix update', description: 'Define severity levels and ownership rules', assignedTo: m1._id, priority: 'high', status: 'in-progress', dueDate: addDays(1) },
        { title: 'Measure SLA baseline', description: 'Report average response and resolution times', assignedTo: m2._id, priority: 'low', status: 'done', dueDate: addDays(-3) }
      ]
    },
    {
      name: 'Data Migration Phase 1',
      description: 'Migrate legacy records to the new schema with validation checks.',
      owner: adminId,
      members: [m3._id, m4._id],
      tasks: [
        { title: 'Map old-to-new schema fields', description: 'Document transformation rules for each entity', assignedTo: m3._id, priority: 'high', status: 'done', dueDate: addDays(-4) },
        { title: 'Build migration dry-run script', description: 'Simulate migration with rollback capability', assignedTo: m4._id, priority: 'high', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Validate migrated sample', description: 'Compare 200 records for data consistency', assignedTo: m3._id, priority: 'medium', status: 'todo', dueDate: addDays(5) }
      ]
    },
    {
      name: 'Internal Security Audit',
      description: 'Review access controls, secrets handling, and dependency vulnerabilities.',
      owner: adminId,
      members: [m1._id, m2._id, m4._id],
      tasks: [
        { title: 'Rotate shared credentials', description: 'Replace old shared secrets and update vault entries', assignedTo: m1._id, priority: 'high', status: 'todo', dueDate: addDays(3) },
        { title: 'Dependency CVE scan', description: 'Run and report critical/high vulnerabilities', assignedTo: m4._id, priority: 'medium', status: 'in-progress', dueDate: addDays(2) },
        { title: 'Review RBAC permission matrix', description: 'Verify admin/member API boundaries', assignedTo: m2._id, priority: 'high', status: 'done', dueDate: addDays(-1) }
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

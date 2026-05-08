import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/authState';
import api from '../api/axios';

const STATUS_COLS = ['todo', 'in-progress', 'done'];
const statusColor = { todo:'#89b4fa', 'in-progress':'#fab387', done:'#a6e3a1' };
const priorityColor = { high:'#f38ba8', medium:'#fab387', low:'#a6e3a1' };

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title:'', description:'', assignedTo:'', priority:'medium', dueDate:''
  });

  const fetchAll = async () => {
    const [pRes, tRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?projectId=${id}`)
    ]);
    setProject(pRes.data);
    setTasks(tRes.data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      setLoading(true);
      setError('');
      try {
        const [pRes, tRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}`)
        ]);

        if (isMounted) {
          setProject(pRes.data);
          setTasks(tRes.data);
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Unable to load project');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');

    if (form.title.trim().length < 3) {
      setError('Task title must be at least 3 characters');
      return;
    }

    setSaving(true);
    try {
      await api.post('/tasks', { ...form, title: form.title.trim(), description: form.description.trim(), projectId: id });
      setForm({ title:'', description:'', assignedTo:'', priority:'medium', dueDate:'' });
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    setError('');
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail.trim() });
      setMemberEmail('');
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    setError('');
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="app-page" style={styles.page}>
        <div className="app-skeleton" />
      </div>
    );
  }

  if (!project) {
    return <div className="app-page" style={styles.page}>{error && <div className="app-alert">{error}</div>}</div>;
  }

  return (
    <div className="app-page" style={styles.page}>
      <h1 style={styles.heading}>{project.name}</h1>
      <p style={styles.desc}>{project.description || 'No project description'}</p>

      {error && <div className="app-alert">{error}</div>}

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Team Members</h3>
        <div style={styles.membersList}>
          {project.members?.map(m => (
            <span key={m._id} style={styles.memberChip}>
              {m.name} <span style={styles.roleTag}>{m.role}</span>
            </span>
          ))}
        </div>
        {user?.role === 'admin' && (
          <form className="add-member-form" onSubmit={handleAddMember} style={styles.addMemberForm}>
            <input className="app-input" style={styles.input} placeholder="Add member by email"
              type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
            <button className="app-button" style={styles.btnSmall}>Add</button>
          </form>
        )}
      </div>

      {user?.role === 'admin' && (
        <div style={styles.section}>
          <button className="app-button" style={styles.btn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Task'}
          </button>
          {showForm && (
            <form className="task-form" onSubmit={handleCreateTask} style={styles.taskForm}>
              <input className="app-input" style={styles.input} placeholder="Task title"
                value={form.title} maxLength={120}
                onChange={e => setForm({...form, title: e.target.value})} required />
              <input className="app-input" style={styles.input} placeholder="Description"
                value={form.description} maxLength={300}
                onChange={e => setForm({...form, description: e.target.value})} />
              <select className="app-input" style={styles.input} value={form.assignedTo}
                onChange={e => setForm({...form, assignedTo: e.target.value})}>
                <option value="">Unassigned</option>
                {project.members?.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <select className="app-input" style={styles.input} value={form.priority}
                onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input className="app-input" style={styles.input} type="date" value={form.dueDate}
                onChange={e => setForm({...form, dueDate: e.target.value})} />
              <button className="app-button" style={styles.btn} disabled={saving}>
                {saving ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="kanban-board" style={styles.board}>
        {STATUS_COLS.map(col => {
          const columnTasks = tasks.filter(t => t.status === col);

          return (
            <div key={col} style={styles.column}>
              <h3 style={{...styles.colTitle, color: statusColor[col]}}>
                {col.toUpperCase()} ({columnTasks.length})
              </h3>
              {columnTasks.length === 0
                ? <p className="app-empty">No {col.replace('-', ' ')} tasks</p>
                : columnTasks.map(task => (
                  <div key={task._id} style={styles.taskCard}>
                    <p style={styles.taskTitle}>{task.title}</p>
                    {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                    <div style={styles.taskMeta}>
                      <span style={{...styles.badge, background: priorityColor[task.priority]+'25',
                        color: priorityColor[task.priority]}}>{task.priority}</span>
                      {task.assignedTo && (
                        <span style={styles.assignee}>{task.assignedTo.name}</span>
                      )}
                    </div>
                    {task.dueDate && (
                      <p style={styles.due}>Due {new Date(task.dueDate).toLocaleDateString()}</p>
                    )}
                    <select style={styles.statusSelect} value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}>
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {user?.role === 'admin' && (
                      <button style={styles.deleteBtn}
                        onClick={() => handleDeleteTask(task._id)}>Delete</button>
                    )}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  page: { padding:'32px 24px', maxWidth:1200, margin:'0 auto' },
  heading: { color:'#cba6f7', fontSize:28, marginBottom:4, lineHeight:1.2 },
  desc: { color:'#a6adc8', marginBottom:32 },
  section: { background:'#313244', borderRadius:8, padding:24, marginBottom:24, border:'1px solid #45475a' },
  sectionTitle: { color:'#cdd6f4', marginBottom:14, fontSize:15 },
  membersList: { display:'flex', gap:10, flexWrap:'wrap', marginBottom:14 },
  memberChip: { background:'#45475a', color:'#cdd6f4', padding:'6px 14px',
    borderRadius:20, fontSize:13, display:'flex', alignItems:'center', gap:6 },
  roleTag: { background:'#cba6f730', color:'#cba6f7', padding:'1px 8px',
    borderRadius:10, fontSize:11 },
  addMemberForm: { display:'flex', gap:10 },
  taskForm: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16 },
  input: { padding:'10px 14px', borderRadius:8, border:'1px solid #45475a',
    background:'#1e1e2e', color:'#cdd6f4', fontSize:14 },
  btn: { background:'#7c6af7', color:'#fff', border:'none', padding:'10px 20px',
    borderRadius:8, cursor:'pointer', fontWeight:600 },
  btnSmall: { background:'#7c6af7', color:'#fff', border:'none', padding:'10px 18px',
    borderRadius:8, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' },
  board: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginTop:8 },
  column: { background:'#313244', borderRadius:8, padding:16, minHeight:300, border:'1px solid #45475a' },
  colTitle: { fontSize:13, fontWeight:700, marginBottom:16, letterSpacing:1 },
  taskCard: { background:'#1e1e2e', borderRadius:8, padding:14, marginBottom:12,
    border:'1px solid #45475a' },
  taskTitle: { color:'#cdd6f4', fontWeight:500, marginBottom:6 },
  taskDesc: { color:'#a6adc8', fontSize:13, marginBottom:8 },
  taskMeta: { display:'flex', gap:8, alignItems:'center', marginBottom:6, flexWrap:'wrap' },
  badge: { padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:500 },
  assignee: { color:'#89b4fa', fontSize:12 },
  due: { color:'#a6adc8', fontSize:12, marginBottom:8 },
  statusSelect: { width:'100%', padding:'6px 10px', borderRadius:6, marginBottom:8,
    border:'1px solid #45475a', background:'#313244', color:'#cdd6f4', fontSize:13 },
  deleteBtn: { width:'100%', padding:'6px', background:'#f38ba820', color:'#f38ba8',
    border:'1px solid #f38ba840', borderRadius:6, cursor:'pointer', fontSize:12 }
};

export default ProjectDetail;

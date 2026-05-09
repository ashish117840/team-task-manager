import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authState';
import api from '../api/axios';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name:'', description:'' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/projects');
        if (isMounted) setProjects(data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Unable to load projects');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');

    const name = form.name.trim();
    if (name.length < 3) {
      setError('Project name must be at least 3 characters');
      return;
    }

    setSaving(true);
    try {
      await api.post('/projects', { ...form, name, description: form.description.trim() });
      setForm({ name:'', description:'' });
      setShowForm(false);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-page" style={styles.page}>
      <div className="app-header" style={styles.header}>
        <div>
          <h1 style={styles.heading}>Projects</h1>
          <p style={styles.sub}>Set up project spaces, bring in teammates, and keep delivery visible from day one.</p>
        </div>
        {user?.role === 'admin' && (
          <button className="app-button" style={styles.btn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {error && <div className="app-alert">{error}</div>}

      {showForm && (
        <form className="app-form" onSubmit={handleCreate} style={styles.form}>
          <input className="app-input" style={styles.input} placeholder="Project name"
            value={form.name} maxLength={80}
            onChange={e => setForm({...form, name: e.target.value})} required />
          <input className="app-input" style={styles.input} placeholder="Description (optional)"
            value={form.description} maxLength={240}
            onChange={e => setForm({...form, description: e.target.value})} />
          <button className="app-button" style={styles.btn} disabled={saving}>
            {saving ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={styles.grid}>
          {[1, 2, 3].map(item => <div className="app-skeleton" key={item} />)}
        </div>
      ) : (
        <div style={styles.grid}>
          {projects.length === 0
            ? <p className="app-empty">No projects yet. Start a workspace and add the first delivery stream.</p>
            : projects.map(p => (
              <Link to={`/projects/${p._id}`} key={p._id} style={styles.card}>
                <h3 style={styles.cardTitle}>{p.name}</h3>
                <p style={styles.cardDesc}>{p.description || 'No project summary added yet'}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.members}>{p.members?.length || 0} members</span>
                  <span style={styles.owner}>Owner: {p.owner?.name}</span>
                </div>
              </Link>
            ))
          }
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding:'32px 24px', maxWidth:1100, margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  heading: { color:'#cdd6f4', fontSize:26, margin:0, lineHeight:1.2 },
  sub: { color:'#a6adc8', marginTop:6, fontSize:14 },
  btn: { background:'#7c6af7', color:'#fff', border:'none', padding:'10px 20px',
    borderRadius:8, cursor:'pointer', fontWeight:600 },
  form: { background:'#313244', padding:24, borderRadius:8, marginBottom:32,
    display:'flex', gap:12, flexWrap:'wrap', alignItems:'center', border:'1px solid #45475a' },
  input: { padding:'10px 14px', borderRadius:8, border:'1px solid #45475a',
    background:'#1e1e2e', color:'#cdd6f4', fontSize:14, flex:1, minWidth:200 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:20 },
  card: { background:'#313244', borderRadius:8, padding:24, textDecoration:'none',
    transition:'transform 0.2s, border-color 0.2s', display:'block', border:'1px solid #45475a' },
  cardTitle: { color:'#cba6f7', fontSize:17, marginBottom:8 },
  cardDesc: { color:'#a6adc8', fontSize:14, marginBottom:16, minHeight:40 },
  cardFooter: { display:'flex', justifyContent:'space-between', gap:10, flexWrap:'wrap' },
  members: { color:'#89b4fa', fontSize:13 },
  owner: { color:'#6c7086', fontSize:13 }
};

export default Projects;

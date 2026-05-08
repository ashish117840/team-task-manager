import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authState';
import api from '../api/axios';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name:'', description:'' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    setProjects(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadProjects = async () => {
      const { data } = await api.get('/projects');
      if (isMounted) setProjects(data);
    };

    loadProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', form);
      setForm({ name:'', description:'' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Projects</h1>
        {user?.role === 'admin' && (
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} placeholder="Project name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={styles.input} placeholder="Description (optional)"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      <div style={styles.grid}>
        {projects.length === 0
          ? <p style={styles.empty}>No projects yet. Create one!</p>
          : projects.map(p => (
            <Link to={`/projects/${p._id}`} key={p._id} style={styles.card}>
              <h3 style={styles.cardTitle}>{p.name}</h3>
              <p style={styles.cardDesc}>{p.description || 'No description'}</p>
              <div style={styles.cardFooter}>
                <span style={styles.members}>👥 {p.members?.length} members</span>
                <span style={styles.owner}>by {p.owner?.name}</span>
              </div>
            </Link>
          ))
        }
      </div>
    </div>
  );
};

const styles = {
  page: { padding:'32px 24px', maxWidth:1100, margin:'0 auto' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  heading: { color:'#cdd6f4', fontSize:26 },
  btn: { background:'#7c6af7', color:'#fff', border:'none', padding:'10px 20px',
    borderRadius:8, cursor:'pointer', fontWeight:600 },
  form: { background:'#313244', padding:24, borderRadius:12, marginBottom:32,
    display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' },
  input: { padding:'10px 14px', borderRadius:8, border:'1px solid #45475a',
    background:'#1e1e2e', color:'#cdd6f4', fontSize:14, flex:1, minWidth:200 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:20 },
  card: { background:'#313244', borderRadius:12, padding:24, textDecoration:'none',
    transition:'transform 0.2s', display:'block', border:'1px solid #45475a' },
  cardTitle: { color:'#cba6f7', fontSize:17, marginBottom:8 },
  cardDesc: { color:'#a6adc8', fontSize:14, marginBottom:16 },
  cardFooter: { display:'flex', justifyContent:'space-between' },
  members: { color:'#89b4fa', fontSize:13 },
  owner: { color:'#6c7086', fontSize:13 },
  empty: { color:'#6c7086' }
};

export default Projects;

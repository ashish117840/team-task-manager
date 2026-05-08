import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusColor = { todo:'#89b4fa', 'in-progress':'#fab387', done:'#a6e3a1' };
const priorityColor = { high:'#f38ba8', medium:'#fab387', low:'#a6e3a1' };

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    const { data } = await api.get('/tasks/my');
    setTasks(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/tasks/my');
        if (isMounted) setTasks(data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Unable to load tasks');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatus = async (taskId, status) => {
    setUpdatingId(taskId);
    setError('');
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingId('');
    }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="app-page" style={styles.page}>
      <h1 style={styles.heading}>My Tasks</h1>
      <div style={styles.filters}>
        {['all','todo','in-progress','done'].map(f => (
          <button key={f} style={{...styles.filterBtn,
            background: filter === f ? '#7c6af7' : '#313244',
            color: filter === f ? '#fff' : '#a6adc8'}}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {error && <div className="app-alert">{error}</div>}

      {loading ? (
        <div style={styles.list}>
          {[1, 2, 3].map(item => <div className="app-skeleton" key={item} />)}
        </div>
      ) : filtered.length === 0
        ? <p className="app-empty">No tasks match this filter</p>
        : filtered.map(t => (
          <div className="task-list-row" key={t._id} style={styles.row}>
            <div style={styles.info}>
              <p style={styles.title}>{t.title}</p>
              <p style={styles.project}>{t.project?.name || 'No project'}</p>
            </div>
            <span style={{...styles.badge, background: priorityColor[t.priority]+'25',
              color: priorityColor[t.priority]}}>{t.priority}</span>
            {t.dueDate && (
              <span style={styles.due}>Due {new Date(t.dueDate).toLocaleDateString()}</span>
            )}
            <select style={{...styles.select, color: statusColor[t.status]}}
              disabled={updatingId === t._id}
              value={t.status} onChange={e => handleStatus(t._id, e.target.value)}>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        ))
      }
    </div>
  );
};

const styles = {
  page: { padding:'32px 24px', maxWidth:900, margin:'0 auto' },
  heading: { color:'#cdd6f4', fontSize:26, marginBottom:20 },
  filters: { display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' },
  filterBtn: { padding:'8px 18px', borderRadius:20, border:'none',
    cursor:'pointer', fontSize:13, fontWeight:500 },
  list: { display:'grid', gap:12 },
  row: { background:'#313244', borderRadius:8, padding:'16px 20px',
    marginBottom:12, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap',
    border:'1px solid #45475a' },
  info: { flex:1, minWidth:180 },
  title: { color:'#cdd6f4', fontWeight:500, marginBottom:4 },
  project: { color:'#89b4fa', fontSize:13 },
  badge: { padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:500 },
  due: { color:'#a6adc8', fontSize:13 },
  select: { padding:'6px 12px', borderRadius:8, border:'1px solid #45475a',
    background:'#1e1e2e', fontSize:13, cursor:'pointer' }
};

export default MyTasks;

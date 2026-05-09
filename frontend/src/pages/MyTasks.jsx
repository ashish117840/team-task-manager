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
      <div style={styles.heroCard}>
        <div>
          <p style={styles.kicker}>Personal task space</p>
          <h1 style={styles.heading}>My Tasks</h1>
          <p style={styles.sub}>Track your assigned work, update status, and keep overdue items visible.</p>
        </div>
        <div style={styles.heroStatWrap}>
          <div style={styles.heroStat}>
            <span style={styles.heroStatLabel}>All</span>
            <strong style={styles.heroStatValue}>{tasks.length}</strong>
          </div>
          <div style={styles.heroStat}>
            <span style={styles.heroStatLabel}>Open</span>
            <strong style={styles.heroStatValue}>{tasks.filter(t => t.status !== 'done').length}</strong>
          </div>
          <div style={styles.heroStat}>
            <span style={styles.heroStatLabel}>Done</span>
            <strong style={styles.heroStatValue}>{tasks.filter(t => t.status === 'done').length}</strong>
          </div>
        </div>
      </div>

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
  page: { padding:'32px 24px 48px', maxWidth:900, margin:'0 auto' },
  heroCard: {
    display:'flex',
    justifyContent:'space-between',
    gap:20,
    alignItems:'stretch',
    padding:'24px',
    borderRadius:20,
    marginBottom:20,
    border:'1px solid #45475a',
    background:'linear-gradient(135deg, rgba(49,50,68,0.98), rgba(30,30,46,0.98))',
    boxShadow:'0 18px 40px rgba(0,0,0,0.18)'
  },
  kicker: { color:'#89b4fa', fontSize:12, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', marginBottom:10 },
  heading: { color:'#f5e0dc', fontSize:28, marginBottom:8 },
  sub: { color:'#a6adc8', margin:0, maxWidth:560 },
  heroStatWrap: { display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:12, minWidth:280 },
  heroStat: { background:'#1e1e2e', border:'1px solid #45475a', borderRadius:14, padding:'14px 16px', minWidth:76 },
  heroStatLabel: { display:'block', color:'#a6adc8', fontSize:12, marginBottom:6 },
  heroStatValue: { color:'#cdd6f4', fontSize:22, lineHeight:1 },
  filters: { display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' },
  filterBtn: { padding:'9px 18px', borderRadius:999, border:'1px solid #45475a',
    cursor:'pointer', fontSize:13, fontWeight:600, transition:'transform 0.15s ease, box-shadow 0.15s ease' },
  list: { display:'grid', gap:12 },
  row: { background:'linear-gradient(180deg, #313244, #292a3a)', borderRadius:14, padding:'16px 20px',
    marginBottom:12, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap',
    border:'1px solid #45475a', boxShadow:'0 10px 22px rgba(0,0,0,0.12)' },
  info: { flex:1, minWidth:180 },
  title: { color:'#cdd6f4', fontWeight:500, marginBottom:4 },
  project: { color:'#89b4fa', fontSize:13 },
  badge: { padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:500 },
  due: { color:'#a6adc8', fontSize:13 },
  select: { padding:'6px 12px', borderRadius:8, border:'1px solid #45475a',
    background:'#1e1e2e', fontSize:13, cursor:'pointer' }
};

export default MyTasks;

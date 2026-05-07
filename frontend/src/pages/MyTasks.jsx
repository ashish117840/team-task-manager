import { useEffect, useState } from 'react';
import api from '../api/axios';

const statusColor = { todo:'#89b4fa', 'in-progress':'#fab387', done:'#a6e3a1' };
const priorityColor = { high:'#f38ba8', medium:'#fab387', low:'#a6e3a1' };

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/tasks/my').then(r => setTasks(r.data));
  }, []);

  const handleStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    const { data } = await api.get('/tasks/my');
    setTasks(data);
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>My Tasks</h1>
      <div style={styles.filters}>
        {['all','todo','in-progress','done'].map(f => (
          <button key={f} style={{...styles.filterBtn,
            background: filter === f ? '#7c6af7' : '#313244',
            color: filter === f ? '#fff' : '#a6adc8'}}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      {filtered.length === 0
        ? <p style={styles.empty}>No tasks found</p>
        : filtered.map(t => (
          <div key={t._id} style={styles.row}>
            <div style={styles.info}>
              <p style={styles.title}>{t.title}</p>
              <p style={styles.project}>📁 {t.project?.name}</p>
            </div>
            <span style={{...styles.badge, background: priorityColor[t.priority]+'25',
              color: priorityColor[t.priority]}}>{t.priority}</span>
            {t.dueDate && (
              <span style={styles.due}>📅 {new Date(t.dueDate).toLocaleDateString()}</span>
            )}
            <select style={{...styles.select, color: statusColor[t.status]}}
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
  empty: { color:'#6c7086', textAlign:'center', marginTop:40 },
  row: { background:'#313244', borderRadius:10, padding:'16px 20px',
    marginBottom:12, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' },
  info: { flex:1 },
  title: { color:'#cdd6f4', fontWeight:500, marginBottom:4 },
  project: { color:'#7c6af7', fontSize:13 },
  badge: { padding:'3px 12px', borderRadius:20, fontSize:12, fontWeight:500 },
  due: { color:'#a6adc8', fontSize:13 },
  select: { padding:'6px 12px', borderRadius:8, border:'1px solid #45475a',
    background:'#1e1e2e', fontSize:13, cursor:'pointer' }
};

export default MyTasks;
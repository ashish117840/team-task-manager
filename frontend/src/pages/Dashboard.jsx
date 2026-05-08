import { useEffect, useState } from 'react';
import { useAuth } from '../context/authState';
import api from '../api/axios';

const StatCard = ({ label, value, color }) => (
  <div style={{...styles.card, borderTop:`4px solid ${color}`}}>
    <p style={styles.cardLabel}>{label}</p>
    <h2 style={{...styles.cardValue, color}}>{value}</h2>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, overdueRes, myRes] = await Promise.all([
          api.get('/tasks/dashboard'),
          api.get('/tasks/overdue'),
          api.get('/tasks/my')
        ]);
        setStats(statsRes.data);
        setOverdue(overdueRes.data);
        setMyTasks(myRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const priorityColor = { high:'#f38ba8', medium:'#fab387', low:'#a6e3a1' };
  const statusColor = { todo:'#89b4fa', 'in-progress':'#fab387', done:'#a6e3a1' };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Welcome back, {user?.name} 👋</h1>
      <p style={styles.sub}>Here's your task overview</p>

      {stats && (
        <div style={styles.grid}>
          <StatCard label="Total Tasks" value={stats.total} color="#7c6af7" />
          <StatCard label="To Do" value={stats.todo} color="#89b4fa" />
          <StatCard label="In Progress" value={stats.inProgress} color="#fab387" />
          <StatCard label="Completed" value={stats.done} color="#a6e3a1" />
          <StatCard label="Overdue" value={stats.overdue} color="#f38ba8" />
        </div>
      )}

      <div style={styles.sections}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔴 Overdue Tasks ({overdue.length})</h3>
          {overdue.length === 0
            ? <p style={styles.empty}>No overdue tasks 🎉</p>
            : overdue.map(t => (
              <div key={t._id} style={styles.taskRow}>
                <span style={styles.taskTitle}>{t.title}</span>
                <span style={{...styles.badge, background: priorityColor[t.priority]+'30',
                  color: priorityColor[t.priority]}}>{t.priority}</span>
                <span style={styles.project}>{t.project?.name}</span>
                <span style={styles.due}>Due: {new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))
          }
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 My Recent Tasks</h3>
          {myTasks.length === 0
            ? <p style={styles.empty}>No tasks assigned yet</p>
            : myTasks.map(t => (
              <div key={t._id} style={styles.taskRow}>
                <span style={styles.taskTitle}>{t.title}</span>
                <span style={{...styles.badge, background: statusColor[t.status]+'30',
                  color: statusColor[t.status]}}>{t.status}</span>
                <span style={styles.project}>{t.project?.name}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding:'32px 24px', maxWidth:1100, margin:'0 auto' },
  heading: { color:'#cdd6f4', fontSize:26, marginBottom:4 },
  sub: { color:'#a6adc8', marginBottom:32 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))',
    gap:16, marginBottom:40 },
  card: { background:'#313244', borderRadius:12, padding:'20px 24px' },
  cardLabel: { color:'#a6adc8', fontSize:13, marginBottom:8 },
  cardValue: { fontSize:36, fontWeight:700, margin:0 },
  sections: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 },
  section: { background:'#313244', borderRadius:12, padding:24 },
  sectionTitle: { color:'#cdd6f4', marginBottom:16, fontSize:15 },
  empty: { color:'#6c7086', fontSize:14 },
  taskRow: { display:'flex', alignItems:'center', gap:10, padding:'10px 0',
    borderBottom:'1px solid #45475a', flexWrap:'wrap' },
  taskTitle: { color:'#cdd6f4', fontSize:14, flex:1 },
  badge: { padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:500 },
  project: { color:'#7c6af7', fontSize:12 },
  due: { color:'#f38ba8', fontSize:12 }
};

export default Dashboard;

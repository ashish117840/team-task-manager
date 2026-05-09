import { useEffect, useState } from 'react';
import { useAuth } from '../context/authState';
import api from '../api/axios';

const priorityColor = { high:'#f38ba8', medium:'#fab387', low:'#a6e3a1' };
const statusColor = { todo:'#89b4fa', 'in-progress':'#fab387', done:'#a6e3a1' };

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, overdueRes, myRes] = await Promise.all([
          api.get('/tasks/dashboard'),
          api.get('/tasks/overdue'),
          api.get('/tasks/my')
        ]);

        if (isMounted) {
          setStats(statsRes.data);
          setOverdue(overdueRes.data);
          setMyTasks(myRes.data.slice(0, 5));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load dashboard data');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="app-page" style={styles.page}>
      <div style={styles.assignmentCard}>
        <p style={styles.assignmentKicker}>Assignment: Team Task Manager (Full-Stack)</p>
        <h2 style={styles.assignmentTitle}>Build projects, assign tasks, and track progress with Admin and Member roles.</h2>
        <div style={styles.assignmentGrid}>
          <div style={styles.assignmentItem}>
            <span style={styles.assignmentLabel}>Authentication</span>
            <span style={styles.assignmentValue}>Signup / Login</span>
          </div>
          <div style={styles.assignmentItem}>
            <span style={styles.assignmentLabel}>Project & team</span>
            <span style={styles.assignmentValue}>Management</span>
          </div>
          <div style={styles.assignmentItem}>
            <span style={styles.assignmentLabel}>Task workflow</span>
            <span style={styles.assignmentValue}>Assignment & status tracking</span>
          </div>
          <div style={styles.assignmentItem}>
            <span style={styles.assignmentLabel}>Dashboard</span>
            <span style={styles.assignmentValue}>Tasks, status, overdue</span>
          </div>
        </div>
      </div>

      <h1 style={styles.heading}>Welcome back, {user?.name}</h1>
      <p style={styles.sub}>Your current task overview</p>

      {error && <div className="app-alert">{error}</div>}

      {loading ? (
        <div style={styles.grid}>
          {[1, 2, 3, 4, 5].map(item => <div className="app-skeleton" key={item} />)}
        </div>
      ) : stats && (
        <div style={styles.grid}>
          <StatCard label="Total Tasks" value={stats.total} color="#7c6af7" />
          <StatCard label="To Do" value={stats.todo} color="#89b4fa" />
          <StatCard label="In Progress" value={stats.inProgress} color="#fab387" />
          <StatCard label="Completed" value={stats.done} color="#a6e3a1" />
          <StatCard label="Overdue" value={stats.overdue} color="#f38ba8" />
        </div>
      )}

      <div className="dashboard-sections" style={styles.sections}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Overdue Tasks ({overdue.length})</h3>
          {overdue.length === 0
            ? <p className="app-empty">No overdue tasks</p>
            : overdue.map(t => (
              <div className="task-row" key={t._id} style={styles.taskRow}>
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
          <h3 style={styles.sectionTitle}>My Recent Tasks</h3>
          {myTasks.length === 0
            ? <p className="app-empty">No tasks assigned yet</p>
            : myTasks.map(t => (
              <div className="task-row" key={t._id} style={styles.taskRow}>
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
  page: { padding:'32px 24px 48px', maxWidth:1100, margin:'0 auto' },
  assignmentCard: {
    marginBottom: 30,
    padding: '24px',
    borderRadius: 20,
    border: '1px solid #45475a',
    background: 'linear-gradient(135deg, rgba(49,50,68,0.98), rgba(30,30,46,0.98))',
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.22)'
  },
  assignmentKicker: { color:'#89b4fa', fontSize:12, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', marginBottom:10 },
  assignmentTitle: { color:'#f5e0dc', fontSize:20, lineHeight:1.4, margin:0, maxWidth:760 },
  assignmentGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:12, marginTop:18 },
  assignmentItem: { background:'rgba(69,71,90,0.45)', border:'1px solid rgba(137,180,250,0.12)', borderRadius:14, padding:'14px 16px' },
  assignmentLabel: { display:'block', color:'#a6adc8', fontSize:12, marginBottom:4 },
  assignmentValue: { color:'#cdd6f4', fontSize:14, fontWeight:600 },
  heading: { color:'#f5e0dc', fontSize:28, marginBottom:4, lineHeight:1.2 },
  sub: { color:'#a6adc8', marginBottom:28 },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))',
    gap:16, marginBottom:40 },
  card: { background:'linear-gradient(180deg, #313244, #292a3a)', borderRadius:16, padding:'20px 24px', border:'1px solid #45475a', boxShadow:'0 12px 28px rgba(0,0,0,0.14)' },
  cardLabel: { color:'#a6adc8', fontSize:13, marginBottom:8 },
  cardValue: { fontSize:36, fontWeight:700, margin:0 },
  sections: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 },
  section: { background:'#313244', borderRadius:16, padding:24, border:'1px solid #45475a', boxShadow:'0 14px 30px rgba(0,0,0,0.12)' },
  sectionTitle: { color:'#cdd6f4', marginBottom:16, fontSize:15 },
  taskRow: { display:'flex', alignItems:'center', gap:10, padding:'10px 0',
    borderBottom:'1px solid #45475a', flexWrap:'wrap' },
  taskTitle: { color:'#cdd6f4', fontSize:14, flex:1, minWidth:140 },
  badge: { padding:'2px 10px', borderRadius:20, fontSize:12, fontWeight:500 },
  project: { color:'#89b4fa', fontSize:12 },
  due: { color:'#f38ba8', fontSize:12 }
};

export default Dashboard;

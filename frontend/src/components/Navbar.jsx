import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authState';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="app-nav" style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.logo}>TaskManager</Link>
        <span style={styles.brandTag}>Admin / Member</span>
      </div>
      <div className="app-nav-links" style={styles.links}>
        <Link className="app-nav-link" to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link className="app-nav-link" to="/projects" style={styles.link}>Projects</Link>
        <Link className="app-nav-link" to="/my-tasks" style={styles.link}>My Tasks</Link>
        <span className="app-role" style={styles.role}>{user?.role}</span>
        <span className="app-user-name" style={styles.name}>{user?.name}</span>
        <button className="app-nav-action" onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: { display:'flex', justifyContent:'space-between', alignItems:'center',
    padding:'14px 24px', background:'linear-gradient(135deg, rgba(30,30,46,0.98), rgba(17,17,27,0.98))', color:'#fff', position:'sticky', top:0, zIndex:100,
    borderBottom:'1px solid #313244', backdropFilter:'blur(12px)', boxShadow:'0 8px 24px rgba(0,0,0,0.22)' },
  brand: { display:'flex', alignItems:'center', gap:12 },
  logo: { color:'#a6e3a1', fontWeight:800, fontSize:20, textDecoration:'none', letterSpacing:0.4 },
  brandTag: { background:'#313244', color:'#89b4fa', padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.8 },
  links: { display:'flex', alignItems:'center', gap:18 },
  link: { color:'#cdd6f4', textDecoration:'none', fontSize:14, padding:'8px 10px', borderRadius:10 },
  role: { background:'#313244', color:'#cba6f7', padding:'4px 10px',
    borderRadius:20, fontSize:12, textTransform:'uppercase' },
  name: { color:'#a6e3a1', fontSize:14, fontWeight:500 },
  btn: { background:'linear-gradient(135deg, #f38ba8, #fab387)', color:'#1e1e2e', border:'none',
    padding:'6px 16px', borderRadius:8, cursor:'pointer', fontWeight:600 }
};

export default Navbar;

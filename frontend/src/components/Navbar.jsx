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
    padding:'12px 24px', background:'#1e1e2e', color:'#fff', position:'sticky', top:0, zIndex:100,
    borderBottom:'1px solid #313244' },
  brand: { display:'flex', alignItems:'center' },
  logo: { color:'#a6e3a1', fontWeight:800, fontSize:20, textDecoration:'none' },
  links: { display:'flex', alignItems:'center', gap:20 },
  link: { color:'#cdd6f4', textDecoration:'none', fontSize:14 },
  role: { background:'#313244', color:'#cba6f7', padding:'2px 10px',
    borderRadius:20, fontSize:12, textTransform:'uppercase' },
  name: { color:'#a6e3a1', fontSize:14, fontWeight:500 },
  btn: { background:'#f38ba8', color:'#1e1e2e', border:'none',
    padding:'6px 16px', borderRadius:8, cursor:'pointer', fontWeight:600 }
};

export default Navbar;

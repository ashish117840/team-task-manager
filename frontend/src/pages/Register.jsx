import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authState';
import api from '../api/axios';

const Register = () => {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>⚡ TaskManager</h2>
        <p style={styles.sub}>Create your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Full Name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={styles.input} type="email" placeholder="Email"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={styles.input} type="password" placeholder="Password (min 6 chars)"
            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <select style={styles.input} value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button style={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.footer}>
          Have account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center',
    justifyContent:'center', background:'#1e1e2e' },
  card: { background:'#313244', padding:40, borderRadius:16, width:360,
    boxShadow:'0 8px 32px rgba(0,0,0,0.4)' },
  title: { color:'#cba6f7', textAlign:'center', marginBottom:4, fontSize:24 },
  sub: { color:'#a6adc8', textAlign:'center', marginBottom:24, fontSize:14 },
  error: { background:'#f38ba820', color:'#f38ba8', padding:'10px 14px',
    borderRadius:8, marginBottom:16, fontSize:14 },
  input: { width:'100%', padding:'12px 14px', marginBottom:14, borderRadius:8,
    border:'1px solid #45475a', background:'#1e1e2e', color:'#cdd6f4',
    fontSize:14, boxSizing:'border-box' },
  btn: { width:'100%', padding:12, background:'#7c6af7', color:'#fff',
    border:'none', borderRadius:8, fontSize:15, fontWeight:600, cursor:'pointer' },
  footer: { color:'#a6adc8', textAlign:'center', marginTop:20, fontSize:14 },
  link: { color:'#89b4fa' }
};

export default Register;

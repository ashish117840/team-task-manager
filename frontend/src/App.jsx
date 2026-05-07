import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ background:'#1e1e2e', minHeight:'100vh' }}>
      {children}
    </div>
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/projects" element={
            <PrivateRoute><Layout><Projects /></Layout></PrivateRoute>} />
          <Route path="/projects/:id" element={
            <PrivateRoute><Layout><ProjectDetail /></Layout></PrivateRoute>} />
          <Route path="/my-tasks" element={
            <PrivateRoute><Layout><MyTasks /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
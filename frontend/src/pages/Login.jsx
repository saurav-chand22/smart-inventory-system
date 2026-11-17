import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Boxes, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            borderRadius: '16px',
            backgroundColor: '#eef2ff',
            color: '#4f46e5',
            marginBottom: '16px'
          }}>
            <Boxes size={36} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>Smart Inventory & Supply Chain</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            Enterprise Relational Inventory Management Platform
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '18px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or employee"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="quick-logins">
          <button
            type="button"
            onClick={() => setDemoCredentials('admin', 'admin123')}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <ShieldCheck size={14} color="#ef4444" />
            <span>Admin Demo</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoCredentials('employee', 'employee123')}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <User size={14} color="#0284c7" />
            <span>Employee Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

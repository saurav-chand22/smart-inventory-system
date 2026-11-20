import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, CheckCircle2, LogOut } from 'lucide-react';

const ProfileSettings = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & System Information</h1>
          <p className="page-subtitle">View operator credentials, role permissions, and active runtime configuration</p>
        </div>
        <button className="btn btn-danger" onClick={logout}>
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* User Profile Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.fullName || 'User'}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{user?.username}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email Address</span>
              <strong>{user?.email || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Role</span>
              <span className={`badge ${user?.role === 'ROLE_ADMIN' ? 'badge-primary' : 'badge-neutral'}`}>
                {user?.role || 'ROLE_EMPLOYEE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Account Status</span>
              <span className="badge badge-success">
                <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Active & Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
          <ShieldCheck size={16} color={isAdmin ? '#ef4444' : '#0284c7'} />
          <span>Role: <strong style={{ color: '#0f172a' }}>{user?.role}</strong></span>
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#e0e7ff',
            color: '#4338ca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{user?.fullName}</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

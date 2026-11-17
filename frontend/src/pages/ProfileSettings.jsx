import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, Database, Server, CheckCircle2, Lock, LogOut } from 'lucide-react';

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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Auth Token Scheme</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>Bearer JWT (HMAC-SHA256)</span>
            </div>
          </div>
        </div>

        {/* System Stack & DBMS Architecture */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <Server size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Architecture & DBMS Info</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Frontend Core</span>
              <span>React 18 + Vite + React Router v6</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Backend Runtime</span>
              <span>Spring Boot 3.3.5 / Java 21 LTS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Persistence Layer</span>
              <span>Spring Data JPA / Hibernate ORM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Relational Database</span>
              <span>MySQL 8.0 (13 Tables, 3NF Certified)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Transaction Isolation</span>
              <span>ACID Compliant (READ COMMITTED)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Concurrency Control</span>
              <span>Pessimistic Row-Level Write Locks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Privileges Matrix */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Shield size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Role-Based Access Control (RBAC) Matrix</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Operation Module</th>
                <th>ROLE_ADMIN</th>
                <th>ROLE_EMPLOYEE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dashboard & Key Performance Metrics</td>
                <td><span className="badge badge-success">Full Access</span></td>
                <td><span className="badge badge-success">Full Access</span></td>
              </tr>
              <tr>
                <td>Product Catalog & Pricing Management</td>
                <td><span className="badge badge-success">Create / Read / Update / Delete</span></td>
                <td><span className="badge badge-neutral">Read Only</span></td>
              </tr>
              <tr>
                <td>Warehouse Master & Facility Capacities</td>
                <td><span className="badge badge-success">Full Configuration</span></td>
                <td><span className="badge badge-neutral">Read Only</span></td>
              </tr>
              <tr>
                <td>Stock Adjustments & Inter-Warehouse Transfers</td>
                <td><span className="badge badge-success">Execute & Audit</span></td>
                <td><span className="badge badge-success">Execute & Audit</span></td>
              </tr>
              <tr>
                <td>Purchase Orders & Goods Receipt Stock Update</td>
                <td><span className="badge badge-success">Full Lifecycle</span></td>
                <td><span className="badge badge-success">Create & Receive</span></td>
              </tr>
              <tr>
                <td>Customer Orders & Stock Reservation</td>
                <td><span className="badge badge-success">Full Lifecycle</span></td>
                <td><span className="badge badge-success">Create, Confirm, Cancel</span></td>
              </tr>
              <tr>
                <td>Outbound Shipments & Dispatch</td>
                <td><span className="badge badge-success">Full Management</span></td>
                <td><span className="badge badge-success">Create & Dispatch</span></td>
              </tr>
              <tr>
                <td>User Administration & Account Activation</td>
                <td><span className="badge badge-primary">Exclusive Access</span></td>
                <td><span className="badge badge-danger">Restricted</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

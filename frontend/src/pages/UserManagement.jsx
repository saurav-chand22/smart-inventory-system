import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle, RefreshCw, UserCheck } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Failed to retrieve users. Ensure you have ADMIN permissions.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} user "${user.username}"?`)) {
      return;
    }
    try {
      setTogglingId(user.id);
      await api.patch(`/users/${user.id}/toggle-status`);
      setFeedback({
        type: 'success',
        message: `Account "${user.username}" has been ${user.isActive ? 'deactivated' : 'activated'}.`
      });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.fullName && u.fullName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      (u.role && u.role.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User & Access Management</h1>
          <p className="page-subtitle">Manage operator accounts, access roles, and system authorization</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Administrator Console</span>
        </div>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      {/* Info notice about RBAC */}
      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <strong>Role-Based Access Control (RBAC):</strong>
        <span style={{ marginLeft: '0.5rem' }}>
          <strong>ROLE_ADMIN</strong> has full read/write/delete privileges across all 14 modules.
          <strong>ROLE_EMPLOYEE</strong> has operational access to create orders, shipments, and inventory movements.
        </span>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by username, full name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '0.5rem' }} />
            <div>Loading registered users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No Users Found</h3>
            <p>No user accounts matched the filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Registered On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{u.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.fullName || '—'}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>@{u.username}</span>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {u.role === 'ROLE_ADMIN' ? (
                        <span className="badge badge-primary">
                          <ShieldCheck size={13} style={{ marginRight: 4 }} /> ADMIN
                        </span>
                      ) : (
                        <span className="badge badge-neutral">
                          <UserCheck size={13} style={{ marginRight: 4 }} /> EMPLOYEE
                        </span>
                      )}
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="badge badge-success">
                          <CheckCircle size={13} style={{ marginRight: 4 }} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <XCircle size={13} style={{ marginRight: 4 }} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {togglingId === u.id
                          ? 'Updating...'
                          : u.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

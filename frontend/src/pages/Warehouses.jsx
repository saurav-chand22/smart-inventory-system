import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Building, MapPin, Phone } from 'lucide-react';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 10000,
    contactNumber: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenAdd = () => {
    setEditingWarehouse(null);
    setFormData({
      name: '',
      location: '',
      capacity: 25000,
      contactNumber: '',
      status: 'ACTIVE'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w) => {
    setEditingWarehouse(w);
    setFormData({
      name: w.name,
      location: w.location,
      capacity: w.capacity,
      contactNumber: w.contactNumber || '',
      status: w.status
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.id}`, formData);
      } else {
        await api.post('/warehouses', formData);
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
      fetchWarehouses();
    } catch (err) {
      alert(err.message || 'Failed to delete warehouse');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Warehouses & Storage Facilities</h1>
          <p className="page-subtitle">Track regional hubs, square footage capacities, and storage logistics</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus size={16} />
            <span>Add Warehouse</span>
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Facility Name</th>
              <th>Location Address</th>
              <th>Max Capacity (Units)</th>
              <th>Dispatch Phone</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {warehouses.map((w) => (
              <tr key={w.id}>
                <td>#{w.id}</td>
                <td>
                  <strong>{w.name}</strong>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                    <MapPin size={12} color="#64748b" /> {w.location}
                  </span>
                </td>
                <td>
                  <strong>{w.capacity.toLocaleString()}</strong> units
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                    <Phone size={12} color="#64748b" /> {w.contactNumber || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${w.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                    {w.status}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleOpenEdit(w)} className="btn btn-secondary btn-sm" title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(w.id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? 'Edit Warehouse Facility' : 'Add New Warehouse'}
      >
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Warehouse Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Physical Address</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Capacity Limit (Total Units)</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-control"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Operational Status</label>
            <select
              className="form-control"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingWarehouse ? 'Save Changes' : 'Create Warehouse'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Warehouses;

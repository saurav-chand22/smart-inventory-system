import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Truck, Plus, Search, CheckCircle, Clock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    orderId: '',
    warehouseId: '',
    carrier: 'BlueDart Express',
    trackingNumber: '',
    notes: ''
  });

  useEffect(() => {
    fetchShipments();
    fetchDependencies();
  }, []);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipments');
      setShipments(res.data || []);
    } catch (err) {
      setFeedback({ type: 'danger', message: 'Failed to fetch shipments.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [ordRes, whRes] = await Promise.all([
        api.get('/customer-orders'),
        api.get('/warehouses')
      ]);
      const ordList = ordRes.data || [];
      const whList = whRes.data || [];
      setOrders(ordList);
      setWarehouses(whList);
      if (whList.length > 0) {
        setFormData(prev => ({ ...prev, warehouseId: whList[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch orders or warehouses', err);
    }
  };

  const generateTrackingNumber = () => {
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    setFormData(prev => ({
      ...prev,
      trackingNumber: `TRK-${Date.now().toString().slice(-6)}-${randomHex}`
    }));
  };

  const handleOpenModal = () => {
    generateTrackingNumber();
    if (warehouses.length > 0 && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: warehouses[0].id }));
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.orderId) {
      setFeedback({ type: 'danger', message: 'Please select a customer order.' });
      return;
    }
    setActionLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      await api.post('/shipments', {
        orderId: Number(formData.orderId),
        warehouseId: Number(formData.warehouseId || warehouses[0]?.id || 1),
        carrier: formData.carrier,
        trackingNumber: formData.trackingNumber,
        notes: formData.notes
      });
      setFeedback({ type: 'success', message: 'Shipment created successfully.' });
      setIsModalOpen(false);
      setFormData({
        orderId: '',
        warehouseId: warehouses[0]?.id || '',
        carrier: 'BlueDart Express',
        trackingNumber: '',
        notes: ''
      });
      fetchShipments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create shipment.';
      setFeedback({ type: 'danger', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/shipments/${id}/status?status=${newStatus}`);
      setFeedback({ type: 'success', message: `Shipment marked as ${newStatus}.` });
      fetchShipments();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || `Failed to update status to ${newStatus}.`;
      setFeedback({ type: 'danger', message: msg });
    }
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch =
      (s.trackingNumber && s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.carrier && s.carrier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customerOrder?.orderNumber && s.customerOrder.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.customerOrder?.customerName && s.customerOrder.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PREPARING':
      case 'PENDING':
        return <span className="badge badge-warning">Preparing</span>;
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return <span className="badge badge-info">Dispatched</span>;
      case 'DELIVERED':
        return <span className="badge badge-success">Delivered</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Shipment Management</h1>
          <p className="page-subtitle">Track outbound logistics, carriers, and order dispatches</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Create Shipment
        </button>
      </div>

      {feedback.message && (
        <div className={`alert alert-${feedback.type}`}>
          {feedback.message}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by tracking #, carrier, order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PREPARING">Preparing</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '0.5rem' }} />
            <div>Loading shipments...</div>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="empty-state">
            <Truck size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No Shipments Found</h3>
            <p>Create shipments for confirmed customer orders to monitor delivery progress.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Order Ref</th>
                  <th>Customer</th>
                  <th>Carrier</th>
                  <th>Status</th>
                  <th>Shipped Date</th>
                  <th>Delivered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong style={{ fontFamily: 'monospace' }}>{s.trackingNumber}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{s.customerOrder?.orderNumber || `Order #${s.customerOrder?.id}`}</span>
                    </td>
                    <td>{s.customerOrder?.customerName || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={16} color="var(--primary)" />
                        {s.carrier}
                      </div>
                    </td>
                    <td>{getStatusBadge(s.status)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {s.shippedDate ? new Date(s.shippedDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {s.deliveredDate ? new Date(s.deliveredDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(s.status === 'PREPARING' || s.status === 'PENDING') && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Dispatch Shipment (Deducts Stock)"
                            onClick={() => handleUpdateStatus(s.id, 'DISPATCHED')}
                          >
                            Dispatch
                          </button>
                        )}
                        {(s.status === 'DISPATCHED' || s.status === 'IN_TRANSIT') && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Confirm Customer Delivery"
                            onClick={() => handleUpdateStatus(s.id, 'DELIVERED')}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {s.status !== 'DELIVERED' && s.status !== 'CANCELLED' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateStatus(s.id, 'CANCELLED')}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Outbound Shipment"
        maxWidth="550px"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer Order *</label>
            <select
              className="form-control"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              required
            >
              <option value="">-- Select Order --</option>
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customerName} ({o.status} - ₹{o.totalAmount})
                </option>
              ))}
            </select>
            {orders.length === 0 && (
              <small style={{ color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                ℹ️ No customer orders found yet. Create an order on the <strong>Customer Orders</strong> page first.
              </small>
            )}
            {orders.length > 0 && !orders.some(o => o.status === 'CONFIRMED' || o.status === 'PROCESSING') && (
              <small style={{ color: 'var(--warning)', marginTop: '6px', display: 'block' }}>
                ⚠️ <strong>Note:</strong> Orders must be in <strong>CONFIRMED</strong> status to ship. Go to <strong>Customer Orders</strong> and click the blue <strong>"Confirm & Reserve"</strong> button on your order first!
              </small>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Fulfillment Warehouse *</label>
            <select
              className="form-control"
              value={formData.warehouseId}
              onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
              required
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Carrier Partner *</label>
            <select
              className="form-control"
              value={formData.carrier}
              onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
              required
            >
              <option value="BlueDart Express">BlueDart Express</option>
              <option value="FedEx Logistics">FedEx Logistics</option>
              <option value="DTDC Courier">DTDC Courier</option>
              <option value="Delhivery">Delhivery</option>
              <option value="DHL Supply Chain">DHL Supply Chain</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tracking Number *</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-control"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                required
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={generateTrackingNumber}
                title="Regenerate tracking code"
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Handling Notes</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Fragile electronics, handle with extreme care"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            ></textarea>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating...' : 'Create Shipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Shipments;

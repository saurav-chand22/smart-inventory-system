import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, PackageCheck, XCircle, ArrowRight, Eye } from 'lucide-react';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New PO form
  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 10, unitPrice: 0 }]);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, whRes, prodRes] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/suppliers'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      setOrders(poRes.data);
      setSuppliers(supRes.data);
      setWarehouses(whRes.data);
      setProducts(prodRes.data);
      if (supRes.data.length > 0) setSupplierId(supRes.data[0].id);
      if (whRes.data.length > 0) setWarehouseId(whRes.data[0].id);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.unitPrice || 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'productId') {
      const p = products.find(prod => String(prod.id) === String(value));
      if (p) updated[index].unitPrice = p.unitPrice;
    }
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (expectedDeliveryDate && expectedDeliveryDate < todayStr) {
      setError('Expected delivery date cannot be in the past. It must be today or a future date.');
      return;
    }

    try {
      await api.post('/purchase-orders', {
        supplierId: Number(supplierId),
        warehouseId: Number(warehouseId),
        expectedDeliveryDate: expectedDeliveryDate || null,
        items: items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }))
      });
      setIsModalOpen(false);
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Failed to create PO');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/purchase-orders/${id}/status?status=${status}`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'RECEIVED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'APPROVED': return 'badge-info';
      case 'ORDERED': return 'badge-neutral';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchase Orders & Replenishment</h1>
          <p className="page-subtitle">Procurement workflow, vendor supplier orders, and automatic inventory receipt</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 7);
              setExpectedDeliveryDate(nextWeek.toISOString().split('T')[0]);
              setItems([{ productId: products[0]?.id || '', quantity: 10, unitPrice: products[0]?.unitPrice || 0 }]);
              setError('');
              setIsModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Create Purchase Order</span>
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Destination Warehouse</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Received Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((po) => (
              <tr key={po.id}>
                <td><strong>{po.poNumber}</strong></td>
                <td>{po.supplier?.name}</td>
                <td>{po.warehouse?.name}</td>
                <td><strong>₹{parseFloat(po.totalAmount).toFixed(2)}</strong></td>
                <td>
                  <span className={`badge ${getStatusBadge(po.status)}`}>
                    {po.status}
                  </span>
                </td>
                <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                <td>{po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { setSelectedOrder(po); setIsDetailModalOpen(true); }}
                      className="btn btn-secondary btn-sm"
                      title="View Items"
                    >
                      <Eye size={13} />
                    </button>

                    {isAdmin && po.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'APPROVED')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#0284c7' }}
                      >
                        Approve
                      </button>
                    )}

                    {isAdmin && po.status === 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'ORDERED')}
                        className="btn btn-secondary btn-sm"
                      >
                        Order
                      </button>
                    )}

                    {po.status === 'ORDERED' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'RECEIVED')}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#10b981' }}
                        title="Receive goods and increment warehouse stock"
                      >
                        <PackageCheck size={14} />
                        <span>Receive Goods</span>
                      </button>
                    )}

                    {isAdmin && po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(po.id, 'CANCELLED')}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8' }}>No purchase orders recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create PO Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Inbound Purchase Order">
        {error && <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select className="form-control" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Destination Warehouse</label>
              <select className="form-control" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Expected Delivery Date</label>
            <input
              type="date"
              className="form-control"
              min={todayStr}
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
            <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              ℹ️ Delivery date must be today or a future date.
            </small>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Order Line Items</h4>
            <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add Product
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <select
                className="form-control"
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                required
              >
                <option value="">Select SKU</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Qty"
                className="form-control"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                required
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                className="form-control"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="btn btn-secondary btn-sm"
                style={{ color: '#dc2626' }}
              >
                &times;
              </button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Purchase Order</button>
          </div>
        </form>
      </Modal>

      {/* PO Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Purchase Order: ${selectedOrder?.poNumber}`}>
        {selectedOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
              <div><strong>Supplier:</strong> {selectedOrder.supplier?.name}</div>
              <div><strong>Warehouse:</strong> {selectedOrder.warehouse?.name}</div>
              <div><strong>Status:</strong> <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
              <div><strong>Total Amount:</strong> ₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Items Summary</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Ordered Qty</th>
                    <th>Received Qty</th>
                    <th>Unit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(it => (
                    <tr key={it.id}>
                      <td><strong>{it.product?.name}</strong> <span style={{ fontSize: '12px', color: '#64748b' }}>({it.product?.sku})</span></td>
                      <td>{it.orderedQuantity}</td>
                      <td><strong>{it.receivedQuantity}</strong></td>
                      <td>₹{parseFloat(it.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseOrders;

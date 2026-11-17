import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle2, XCircle, Truck, Eye, ShieldAlert } from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Order Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);

  // Confirm/Reserve Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedOrderToConfirm, setSelectedOrderToConfirm] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes, whRes] = await Promise.all([
        api.get('/customer-orders'),
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setOrders(ordRes.data);
      setProducts(prodRes.data);
      setWarehouses(whRes.data);
      if (whRes.data.length > 0) setSelectedWarehouseId(whRes.data[0].id);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customer-orders', {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        items: orderItems.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }))
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to place order');
    }
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/customer-orders/${selectedOrderToConfirm.id}/confirm?warehouseId=${selectedWarehouseId}`);
      setIsConfirmModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Stock reservation failed');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this customer order? If already confirmed, reserved stock will be automatically returned to available inventory.')) return;
    try {
      await api.post(`/customer-orders/${orderId}/cancel?warehouseId=${selectedWarehouseId || 1}`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED': return 'badge-success';
      case 'CONFIRMED': return 'badge-info';
      case 'PROCESSING': return 'badge-info';
      case 'SHIPPED': return 'badge-neutral';
      case 'PENDING': return 'badge-warning';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Sales Orders</h1>
          <p className="page-subtitle">Manage retail/wholesale orders, atomic stock reservations, and fulfillment</p>
        </div>
        <button
          onClick={() => {
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setShippingAddress('');
            setOrderItems([{ productId: products[0]?.id || '', quantity: 1 }]);
            setError('');
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>New Customer Order</span>
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer Name</th>
              <th>Destination Address</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.id}>
                <td><strong>{ord.orderNumber}</strong></td>
                <td>
                  <strong>{ord.customerName}</strong>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{ord.customerEmail}</div>
                </td>
                <td style={{ maxWidth: '200px', fontSize: '13px', color: '#475569' }}>{ord.shippingAddress}</td>
                <td><strong>₹{parseFloat(ord.totalAmount).toFixed(2)}</strong></td>
                <td>
                  <span className={`badge ${getStatusBadge(ord.status)}`}>
                    {ord.status}
                  </span>
                </td>
                <td>{new Date(ord.orderDate).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { setSelectedOrder(ord); setIsDetailModalOpen(true); }}
                      className="btn btn-secondary btn-sm"
                      title="View Details"
                    >
                      <Eye size={13} />
                    </button>

                    {ord.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedOrderToConfirm(ord);
                          setError('');
                          setIsConfirmModalOpen(true);
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#2563eb' }}
                        title="Confirm order and reserve inventory"
                      >
                        <CheckCircle2 size={13} />
                        <span>Confirm & Reserve</span>
                      </button>
                    )}

                    {ord.status !== 'DELIVERED' && ord.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancelOrder(ord.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#dc2626' }}
                        title="Cancel Order and Release Reserved Stock"
                      >
                        <XCircle size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', color: '#94a3b8' }}>No customer orders placed yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Place Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Place Customer Sales Order">
        {error && <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleCreateOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Email</label>
              <input type="email" className="form-control" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-control" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Shipping Destination Address</label>
            <textarea className="form-control" rows="2" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required></textarea>
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Order Products</h4>
            <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Product</button>
          </div>

          {orderItems.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <select className="form-control" value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} required>
                <option value="">Select Product SKU</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{parseFloat(p.unitPrice).toFixed(2)}</option>)}
              </select>
              <input type="number" min="1" placeholder="Qty" className="form-control" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} required />
              <button type="button" onClick={() => handleRemoveItem(index)} className="btn btn-secondary btn-sm" style={{ color: '#dc2626' }}>&times;</button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Create Order</button>
          </div>
        </form>
      </Modal>

      {/* Confirm & Reserve Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title={`Confirm & Reserve Stock: ${selectedOrderToConfirm?.orderNumber}`}>
        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px' }} />
            <strong>ACID Transaction Rollback:</strong> {error}
          </div>
        )}
        <form onSubmit={handleConfirmReservation}>
          <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
            Select the fulfillment warehouse to verify inventory availability and reserve stock. If any item is deficient, the transaction will automatically abort without modifying stock.
          </p>
          <div className="form-group">
            <label className="form-label">Dispatch Warehouse</label>
            <select
              className="form-control"
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              required
            >
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name} ({w.location})</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Verify Stock & Reserve</button>
          </div>
        </form>
      </Modal>

      {/* Order Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Customer Order: ${selectedOrder?.orderNumber}`}>
        {selectedOrder && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px' }}>
              <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
              <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
              <div><strong>Status:</strong> <span className={`badge ${getStatusBadge(selectedOrder.status)}`}>{selectedOrder.status}</span></div>
              <div><strong>Total Amount:</strong> ₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Purchased Items</h4>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(it => (
                    <tr key={it.id}>
                      <td><strong>{it.product?.name}</strong> <span style={{ fontSize: '12px', color: '#64748b' }}>({it.product?.sku})</span></td>
                      <td>{it.quantity}</td>
                      <td>₹{parseFloat(it.unitPrice).toFixed(2)}</td>
                      <td><strong>₹{parseFloat(it.subtotal).toFixed(2)}</strong></td>
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

export default CustomerOrders;

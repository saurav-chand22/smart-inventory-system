import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import { Boxes, Sliders } from 'lucide-react';

const Inventory = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Form states
  const [adjustForm, setAdjustForm] = useState({ productId: '', warehouseId: '', adjustmentQuantity: 0, reason: '' });
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, whRes, prodRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/warehouses'),
        api.get('/products')
      ]);
      setInventoryList(invRes.data);
      setWarehouses(whRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/inventory/adjust', {
        productId: Number(adjustForm.productId),
        warehouseId: Number(adjustForm.warehouseId),
        adjustmentQuantity: Number(adjustForm.adjustmentQuantity),
        reason: adjustForm.reason
      });
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Stock adjustment failed');
    }
  };


  const filtered = inventoryList.filter(item => {
    const matchesWh = selectedWarehouse ? String(item.warehouse?.id) === String(selectedWarehouse) : true;
    const matchesProd = selectedProduct ? String(item.product?.id) === String(selectedProduct) : true;
    return matchesWh && matchesProd;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory Stock Levels</h1>
          <p className="page-subtitle">Multi-warehouse inventory monitoring, stock reservations, and adjustments</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setAdjustForm({ productId: products[0]?.id || '', warehouseId: warehouses[0]?.id || '', adjustmentQuantity: 0, reason: '' });
              setError('');
              setIsAdjustModalOpen(true);
            }}
            className="btn btn-secondary"
          >
            <Sliders size={16} />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '220px', flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Filter by Warehouse</label>
          <select className="form-control" value={selectedWarehouse} onChange={(e) => setSelectedWarehouse(e.target.value)}>
            <option value="">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '220px', flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Filter by Product</label>
          <select className="form-control" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Available Stock</th>
              <th>Reserved Stock</th>
              <th>Total On-Hand</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.quantityAvailable <= (item.product?.reorderLevel || 10);
              const isOut = item.quantityAvailable === 0;
              return (
                <tr key={item.id}>
                  <td>#{item.id}</td>
                  <td><strong>{item.product?.name}</strong></td>
                  <td>{item.warehouse?.name}</td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: isOut ? '#dc2626' : (isLow ? '#d97706' : '#16a34a') }}>
                      {item.quantityAvailable} units
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ fontWeight: 600 }}>
                      {item.quantityReserved} reserved
                    </span>
                  </td>
                  <td>
                    <strong>{item.quantityAvailable + item.quantityReserved}</strong> units
                  </td>
                  <td>
                    {isOut ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : isLow ? (
                      <span className="badge badge-warning">Low Stock (&lt;={item.product?.reorderLevel})</span>
                    ) : (
                      <span className="badge badge-success">Adequate</span>
                    )}
                  </td>
                  <td>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleString() : 'N/A'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8' }}>No inventory records found for selected criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Adjust Stock Modal */}
      <Modal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} title="Manual Stock Adjustment">
        {error && <div style={{ padding: '10px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '6px', marginBottom: '14px', fontSize: '13px' }}>{error}</div>}
        <form onSubmit={handleAdjustSubmit}>
          <div className="form-group">
            <label className="form-label">Product</label>
            <select
              className="form-control"
              value={adjustForm.productId}
              onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
              required
            >
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select
              className="form-control"
              value={adjustForm.warehouseId}
              onChange={(e) => setAdjustForm({ ...adjustForm, warehouseId: e.target.value })}
              required
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Adjustment Quantity (Use positive to add, negative to deduct)</label>
            <input
              type="number"
              className="form-control"
              value={adjustForm.adjustmentQuantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentQuantity: e.target.value })}
              placeholder="e.g. 10 or -5"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reason / Justification</label>
            <input
              type="text"
              className="form-control"
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              placeholder="e.g. Annual cycle audit, damaged goods written off"
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">Apply Adjustment</button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default Inventory;

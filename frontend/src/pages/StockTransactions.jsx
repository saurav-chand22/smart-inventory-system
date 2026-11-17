import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Filter, Search, ArrowUpRight, ArrowDownLeft, RefreshCw, Repeat, ShieldCheck } from 'lucide-react';

const StockTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFilterOptions();
    fetchTransactions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [prodRes, whRes] = await Promise.all([
        api.get('/products'),
        api.get('/warehouses')
      ]);
      setProducts(prodRes.data || []);
      setWarehouses(whRes.data || []);
    } catch (err) {
      console.error('Error fetching filter options', err);
    }
  };

  const fetchTransactions = async (prodId = selectedProduct, whId = selectedWarehouse) => {
    try {
      setLoading(true);
      let url = '/stock-transactions';
      const params = [];
      if (prodId) params.push(`productId=${prodId}`);
      if (whId) params.push(`warehouseId=${whId}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const val = e.target.value;
    setSelectedProduct(val);
    fetchTransactions(val, selectedWarehouse);
  };

  const handleWarehouseChange = (e) => {
    const val = e.target.value;
    setSelectedWarehouse(val);
    fetchTransactions(selectedProduct, val);
  };

  const handleResetFilters = () => {
    setSelectedProduct('');
    setSelectedWarehouse('');
    setSelectedType('');
    setSearchTerm('');
    fetchTransactions('', '');
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = selectedType ? t.transactionType === selectedType : true;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (t.product?.name && t.product.name.toLowerCase().includes(searchLower)) ||
      (t.product?.sku && t.product.sku.toLowerCase().includes(searchLower)) ||
      (t.warehouse?.name && t.warehouse.name.toLowerCase().includes(searchLower)) ||
      (t.referenceType && t.referenceType.toLowerCase().includes(searchLower)) ||
      (t.notes && t.notes.toLowerCase().includes(searchLower));
    return matchesType && matchesSearch;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'STOCK_IN':
        return <span className="badge badge-success"><ArrowDownLeft size={13} style={{ marginRight: 4 }} /> Stock In</span>;
      case 'STOCK_OUT':
        return <span className="badge badge-danger"><ArrowUpRight size={13} style={{ marginRight: 4 }} /> Stock Out</span>;
      case 'TRANSFER':
        return <span className="badge badge-info"><Repeat size={13} style={{ marginRight: 4 }} /> Transfer</span>;
      case 'ADJUSTMENT':
        return <span className="badge badge-warning">Adjustment</span>;
      case 'RESERVATION':
        return <span className="badge badge-warning">Reserved</span>;
      case 'RELEASE':
        return <span className="badge badge-neutral">Released</span>;
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Transaction Audit Ledger</h1>
          <p className="page-subtitle">Immutable chronological ledger of all physical & allocated inventory movements</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
          <ShieldCheck size={20} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ACID Audited</span>
        </div>
      </div>

      <div className="card">
        {/* Filters Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search SKU, Notes, Ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-control"
            value={selectedProduct}
            onChange={handleProductChange}
          >
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>

          <select
            className="form-control"
            value={selectedWarehouse}
            onChange={handleWarehouseChange}
          >
            <option value="">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>

          <select
            className="form-control"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">All Transaction Types</option>
            <option value="STOCK_IN">STOCK_IN (Goods Receipt)</option>
            <option value="STOCK_OUT">STOCK_OUT (Dispatched)</option>
            <option value="TRANSFER">TRANSFER (Relocation)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (Audit)</option>
            <option value="RESERVATION">RESERVATION (Allocated)</option>
            <option value="RELEASE">RELEASE (Restocked)</option>
          </select>
        </div>

        {(selectedProduct || selectedWarehouse || selectedType || searchTerm) && (
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '0.5rem' }} />
            <div>Loading transaction ledger...</div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-state">
            <History size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No Transactions Found</h3>
            <p>No inventory movements match your current filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Timestamp</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th style={{ textAlign: 'right' }}>Quantity</th>
                  <th>Reference</th>
                  <th>Audited By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-muted)' }}>
                      #{tx.id}
                    </td>
                    <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                    </td>
                    <td>{getTypeBadge(tx.transactionType)}</td>
                    <td>
                      <div>
                        <strong>{tx.product?.name || `Product #${tx.product?.id}`}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.product?.sku}</div>
                      </div>
                    </td>
                    <td>{tx.warehouse?.name || `WH #${tx.warehouse?.id}`}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      <span style={{
                        color: tx.quantity > 0 && tx.transactionType === 'STOCK_IN'
                          ? 'var(--success)'
                          : tx.transactionType === 'STOCK_OUT'
                            ? 'var(--danger)'
                            : 'var(--text-main)'
                      }}>
                        {tx.transactionType === 'STOCK_IN' ? `+${tx.quantity}` : tx.quantity}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {tx.referenceType ? (
                        <span className="badge badge-neutral">
                          {tx.referenceType} #{tx.referenceId}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {tx.user?.fullName || tx.user?.username || 'System Agent'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '240px' }} title={tx.notes}>
                      {tx.notes || '—'}
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

export default StockTransactions;

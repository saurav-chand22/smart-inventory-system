import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart3, DollarSign, Package, AlertTriangle, Printer, RefreshCw, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [reportData, setReportData] = useState(null);
  const [stockMovement, setStockMovement] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [invRes, moveRes] = await Promise.all([
        api.get('/reports/inventory'),
        api.get('/reports/stock-movement')
      ]);
      setReportData(invRes.data.data || {});
      setStockMovement(moveRes.data.data || []);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Reports & Analytics</h1>
          <p className="page-subtitle">Real-time valuation, inventory deficit alerts, and movement audit logs</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={fetchReports} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="stats-grid">
        <StatCard
          title="Total Inventory Valuation"
          value={reportData ? `₹${(reportData.totalInventoryValuation || 0).toLocaleString()}` : '—'}
          subtitle="Real-time asset value"
          icon={DollarSign}
          color="success"
        />
        <StatCard
          title="Total Stocked Units"
          value={reportData ? (reportData.totalStockUnits || 0).toLocaleString() : '—'}
          subtitle="Across all warehouse facilities"
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Low Stock Risk Products"
          value={reportData ? reportData.lowStockProductCount : '—'}
          subtitle="Below safe reorder levels"
          icon={AlertTriangle}
          color="danger"
        />
        <StatCard
          title="Audit Ledger Events"
          value={stockMovement.length}
          subtitle="Recent logged movements"
          icon={FileText}
          color="warning"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'inventory' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            background: 'transparent',
            color: activeTab === 'inventory' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'inventory' ? 600 : 400
          }}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Valuation & Distribution
        </button>
        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'lowStock' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            background: 'transparent',
            color: activeTab === 'lowStock' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'lowStock' ? 600 : 400
          }}
          onClick={() => setActiveTab('lowStock')}
        >
          Low Stock Critical Deficits ({reportData?.lowStockProductCount || 0})
        </button>
        <button
          className="btn"
          style={{
            borderBottom: activeTab === 'movement' ? '2px solid var(--primary)' : 'none',
            borderRadius: 0,
            background: 'transparent',
            color: activeTab === 'movement' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: activeTab === 'movement' ? 600 : 400
          }}
          onClick={() => setActiveTab('movement')}
        >
          Stock Movement Trail
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '0.5rem' }} />
          <div>Synthesizing inventory analytics...</div>
        </div>
      ) : (
        <>
          {/* TAB 1: Inventory Valuation */}
          {activeTab === 'inventory' && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Inventory Valuation by Warehouse & Product
              </h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Warehouse</th>
                      <th>Unit Price</th>
                      <th>Available</th>
                      <th>Reserved</th>
                      <th>Total Units</th>
                      <th style={{ textAlign: 'right' }}>Total Asset Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData?.inventoryRecords || []).map((inv) => {
                      const totalQty = inv.quantityAvailable + inv.quantityReserved;
                      const val = totalQty * (inv.product?.unitPrice || 0);
                      return (
                        <tr key={inv.id}>
                          <td><span className="badge badge-neutral">{inv.product?.sku}</span></td>
                          <td><strong>{inv.product?.name}</strong></td>
                          <td>{inv.warehouse?.name}</td>
                          <td>₹{inv.product?.unitPrice?.toFixed(2)}</td>
                          <td>{inv.quantityAvailable}</td>
                          <td>{inv.quantityReserved}</td>
                          <td>{totalQty}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                            ₹{val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Low Stock Alerts */}
          {activeTab === 'lowStock' && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Critical Stock Deficit & Replenishment Trigger
              </h3>
              {(!reportData?.lowStockProducts || reportData.lowStockProducts.length === 0) ? (
                <div className="empty-state">
                  <Package size={40} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                  <p>All products are currently stocked above their minimum reorder thresholds!</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Unit Price</th>
                        <th>Reorder Level</th>
                        <th>Current Total Stock</th>
                        <th>Deficit Alert</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.lowStockProducts.map((p) => {
                        const totalStock = p.inventories
                          ? p.inventories.reduce((acc, i) => acc + i.quantityAvailable, 0)
                          : 0;
                        const deficit = p.reorderLevel - totalStock;
                        return (
                          <tr key={p.id}>
                            <td><span className="badge badge-danger">{p.sku}</span></td>
                            <td><strong>{p.name}</strong></td>
                            <td>{p.category?.name || '—'}</td>
                            <td>₹{p.unitPrice?.toFixed(2)}</td>
                            <td>{p.reorderLevel} units</td>
                            <td><strong>{totalStock} units</strong></td>
                            <td>
                              <span className="badge badge-danger">
                                Short by {deficit > 0 ? deficit : 0} units
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Stock Movement */}
          {activeTab === 'movement' && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
                Audited Stock Movement Log
              </h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Product</th>
                      <th>Warehouse</th>
                      <th>Qty Change</th>
                      <th>Reference</th>
                      <th>Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockMovement.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontSize: '0.85rem' }}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '—'}
                        </td>
                        <td>
                          <span className={`badge ${
                            tx.transactionType === 'STOCK_IN' ? 'badge-success' :
                            tx.transactionType === 'STOCK_OUT' ? 'badge-danger' :
                            tx.transactionType === 'TRANSFER' ? 'badge-info' : 'badge-warning'
                          }`}>
                            {tx.transactionType}
                          </span>
                        </td>
                        <td>{tx.product?.name} ({tx.product?.sku})</td>
                        <td>{tx.warehouse?.name}</td>
                        <td style={{ fontWeight: 600 }}>{tx.quantity}</td>
                        <td>{tx.referenceType ? `${tx.referenceType} #${tx.referenceId}` : '—'}</td>
                        <td>{tx.user?.fullName || tx.user?.username || 'System'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

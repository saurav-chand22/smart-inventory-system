import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import {
  Package,
  Users,
  Building2,
  Boxes,
  AlertTriangle,
  ClipboardList,
  ShoppingCart,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes, txRes, lowStockRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts'),
        api.get('/stock-transactions'),
        api.get('/products/low-stock')
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
      setRecentTransactions(txRes.data.slice(0, 8));
      setLowStockList(lowStockRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getTransactionBadge = (type) => {
    switch (type) {
      case 'STOCK_IN': return 'badge-success';
      case 'STOCK_OUT': return 'badge-danger';
      case 'STOCK_RESERVATION': return 'badge-warning';
      case 'STOCK_RELEASE': return 'badge-info';
      case 'STOCK_TRANSFER': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  if (loading && !stats) {
    return <div className="page-container"><p>Loading dashboard metrics...</p></div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Real-time inventory levels, supply chain status, and operational alerts</p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {lowStockList.length > 0 && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <AlertTriangle color="#d97706" size={24} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#92400e', fontSize: '14px' }}>
              Low Stock Warning: {lowStockList.length} product(s) are below reorder threshold!
            </strong>
            <p style={{ color: '#b45309', fontSize: '13px', marginTop: '2px' }}>
              Items needing replenishment: {lowStockList.map(p => `${p.name} (SKU: ${p.sku})`).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* 8 Primary KPI Metrics */}
      <div className="stats-grid">
        <StatCard title="Total Products" value={stats?.totalProducts ?? 0} icon={Package} color="#4f46e5" bg="#eef2ff" />
        <StatCard title="Total Suppliers" value={stats?.totalSuppliers ?? 0} icon={Users} color="#0284c7" bg="#f0f9ff" />
        <StatCard title="Active Warehouses" value={stats?.totalWarehouses ?? 0} icon={Building2} color="#059669" bg="#ecfdf5" />
        <StatCard title="Total Stock Units" value={stats?.totalInventoryQuantity ?? 0} icon={Boxes} color="#7c3aed" bg="#f5f3ff" />
        <StatCard title="Low Stock Products" value={stats?.lowStockProducts ?? 0} icon={AlertTriangle} color="#d97706" bg="#fffbeb" />
        <StatCard title="Pending POs" value={stats?.pendingPurchaseOrders ?? 0} icon={ClipboardList} color="#ea580c" bg="#fff7ed" />
        <StatCard title="Pending Customer Orders" value={stats?.pendingCustomerOrders ?? 0} icon={ShoppingCart} color="#2563eb" bg="#eff6ff" />
        <StatCard title="Active Shipments" value={stats?.activeShipments ?? 0} icon={Truck} color="#0891b2" bg="#ecfeff" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Customer Order Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Customer Order Pipelines</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {charts?.orderStatusBreakdown && Object.entries(charts.orderStatusBreakdown).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{status}</span>
                <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Order Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Purchase Order Replenishment</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {charts?.purchaseOrderStatusBreakdown && Object.entries(charts.purchaseOrderStatusBreakdown).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{status}</span>
                <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Stock Transactions Audit Trail */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Stock Movement Audit Trail</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Product</th>
                <th>Warehouse</th>
                <th>Quantity</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Recorded By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id}>
                  <td>#{tx.id}</td>
                  <td>
                    <span className={`badge ${getTransactionBadge(tx.transactionType)}`}>
                      {tx.transactionType}
                    </span>
                  </td>
                  <td><strong>{tx.product?.name}</strong> <span style={{ color: '#64748b', fontSize: '12px' }}>({tx.product?.sku})</span></td>
                  <td>{tx.warehouse?.name}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: tx.quantity > 0 ? '#16a34a' : '#dc2626' }}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </span>
                  </td>
                  <td><code>{tx.referenceId || 'N/A'}</code></td>
                  <td>{tx.description}</td>
                  <td>{tx.createdBy?.fullName || 'System'}</td>
                  <td>{new Date(tx.transactionDate).toLocaleString()}</td>
                </tr>
              ))}
              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', color: '#94a3b8' }}>No stock transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

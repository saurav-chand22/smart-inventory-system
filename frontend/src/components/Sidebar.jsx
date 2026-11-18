import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  Truck,
  Building2,
  Users,
  ShoppingCart,
  FileSpreadsheet,
  ArrowLeftRight,
  ClipboardList,
  UserCheck,
  Settings,
  LogOut,
  ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inventory', path: '/inventory', icon: Boxes },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ClipboardList },
    { name: 'Customer Orders', path: '/customer-orders', icon: ShoppingCart },
    { name: 'Shipments', path: '/shipments', icon: Truck }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '8px', display: 'flex' }}>
          <Boxes size={22} color="#fff" />
        </div>
        <div>
          <h2>Smart Inventory</h2>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>SUPPLY CHAIN OS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.path === '/'}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{user?.fullName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-info'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', background: '#1e293b', color: '#94a3b8', borderColor: '#334155' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

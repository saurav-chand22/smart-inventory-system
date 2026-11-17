import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = '#4f46e5', bg = '#eef2ff' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
      <div className="stat-icon" style={{ backgroundColor: bg, color: color }}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;

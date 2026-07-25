import React from 'react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

const MetricCard = ({ title, value, icon, colorClass, subtitle, trend }) => {
  return (
    <div className="dashboard-card h-100">
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div className={`card-icon-wrapper ${colorClass}`}>
          {icon}
        </div>
        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', background: '#F5F3ED', color: '#6E7079' }}>
          <FaArrowUpRightFromSquare style={{ fontSize: '0.75rem' }} />
        </div>
      </div>

      <div>
        <div className="text-muted fw-bold mb-1" style={{ fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
          {title}
        </div>
        <h2 className="stat-number-large mb-1">
          {value !== undefined && value !== null ? value : 0}
        </h2>
        {subtitle && (
          <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
            {subtitle}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2 border-top d-flex align-items-center justify-content-between" style={{ fontSize: '0.78rem' }}>
          <span className="fw-bold" style={{ color: '#212227' }}>↑ {trend}</span>
          <span className="text-muted">this week</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;

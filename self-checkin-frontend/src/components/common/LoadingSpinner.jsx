import React from 'react';

const LoadingSpinner = ({ text = 'Loading data...' }) => {
  return (
    <div className="text-center py-5">
      <div className="spinner-border mb-2" style={{ width: '2.2rem', height: '2.2rem', color: '#FFD036' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="text-muted fw-bold" style={{ fontSize: '0.88rem' }}>
        {text}
      </div>
    </div>
  );
};

export default LoadingSpinner;

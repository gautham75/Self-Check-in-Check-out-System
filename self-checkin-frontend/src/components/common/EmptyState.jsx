import React from 'react';
import { FaInbox } from 'react-icons/fa';

const EmptyState = ({ title = 'No Data Found', message = 'There are no records to display at this moment.', action }) => {
  return (
    <div className="text-center py-5 px-3 rounded-4 bg-white border shadow-sm my-3">
      <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', background: '#F5F3ED', color: '#6E7079', fontSize: '1.6rem' }}>
        <FaInbox />
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted mb-3" style={{ fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto' }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

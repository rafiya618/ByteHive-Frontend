import React from 'react';

const Tooltip = ({ children, text }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <div className="ds-tooltip" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', display: 'none' }}>
        {text}
      </div>
    </div>
  );
};

export default Tooltip;

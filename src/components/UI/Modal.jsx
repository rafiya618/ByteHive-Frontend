import React from 'react';

const Modal = ({ open, onClose, children, className = '' }) => {
  if (!open) return null;

  return (
    <div className="ds-modal-backdrop" onClick={onClose}>
      <div className={"ds-modal " + className} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;

import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  return (
    <div className="ds-dropdown" ref={ref}>
      <div onClick={() => setOpen((s) => !s)}>{trigger}</div>
      {open && (
        <div className="ds-dropdown-menu" style={{ right: align === 'right' ? 0 : 'auto', left: align === 'left' ? 0 : 'auto' }}>
          {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

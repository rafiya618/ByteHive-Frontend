import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, children, closeOnBackdrop = true }) => {
  const backdropRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const prevActive = document.activeElement;
    // focus modal
    setTimeout(() => containerRef.current?.focus?.(), 0);

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        // simple focus trap
        const focusable = containerRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow || "";
      try {
        prevActive?.focus?.();
      } catch (err) {}
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop) return;
    if (e.target === backdropRef.current) onClose?.();
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        ref={backdropRef}
        onMouseDown={handleBackdropClick}
        className="absolute inset-0 bg-black/60"
      />

      <div
        ref={containerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md mx-auto"
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default Modal;

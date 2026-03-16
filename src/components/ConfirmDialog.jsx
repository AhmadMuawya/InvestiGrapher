import React from 'react';
import './ConfirmDialog.css';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete All</button>
        </div>
      </div>
    </div>
  );
}

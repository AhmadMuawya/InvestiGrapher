import React, { useState } from 'react';
import './EditModal.css';

export default function EditModal({ nodeId, nodeData, onSave, onClose }) {
  const { entity } = nodeData;
  const [label, setLabel] = useState(nodeData.label || entity.name);
  const [attrs, setAttrs] = useState({ ...entity.attributes });

  const handleAttrChange = (key, value) => {
    setAttrs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(nodeId, label, attrs);
  };

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <i className={entity.icon} style={{ color: entity.color, marginRight: '8px' }}></i>
          <span>Edit {entity.name}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="field-group">
            <label className="field-label">Label</label>
            <input
              className="field-input"
              value={label}
              onChange={e => setLabel(e.target.value)}
            />
          </div>

          <div className="field-divider"></div>
          <div className="field-section-title">Attributes</div>

          {Object.entries(attrs).map(([key, value]) => (
            <div className="field-group" key={key}>
              <label className="field-label">{key}</label>
              <input
                className="field-input"
                value={value}
                onChange={e => handleAttrChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

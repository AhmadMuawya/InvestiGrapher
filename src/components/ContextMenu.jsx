import React from 'react';
import './ContextMenu.css';

export default function ContextMenu({
  id, top, left, right, bottom,
  menuType,
  nodeData,
  onAddChild, onEditEntity, onDeleteEntity, onDeleteDescendants,
  onAddStandalone, onRunTransform, onClose,
  entityTypes, availableTransforms, canvasPosition,
}) {
  if (menuType === 'canvas') {
    return (
      <div style={{ top, left, right, bottom }} className="context-menu" onClick={(e) => e.stopPropagation()}>
        <div className="menu-title">Add New Entity</div>
        {Object.entries(entityTypes).map(([key, entity]) => (
          <button key={key} className="menu-item" onClick={() => onAddStandalone(key, canvasPosition)}>
            <i className={entity.icon} style={{ marginRight: '8px', color: entity.color, fontSize: '11px' }}></i>
            {entity.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ top, left, right, bottom }} className="context-menu" onClick={(e) => e.stopPropagation()}>
      <button className="menu-item edit-item" onClick={() => onEditEntity(id, nodeData)}>
        <i className="fa-solid fa-pen-to-square" style={{ marginRight: '8px', fontSize: '11px' }}></i>
        Edit Entity
      </button>

      <button className="menu-item delete-item" onClick={() => onDeleteEntity(id)}>
        <i className="fa-solid fa-trash" style={{ marginRight: '8px', fontSize: '11px' }}></i>
        Delete Entity
      </button>

      <button className="menu-item delete-item" onClick={() => onDeleteDescendants(id)}>
        <i className="fa-solid fa-diagram-predecessor" style={{ marginRight: '8px', fontSize: '11px' }}></i>
        Delete All Descendants
      </button>

      <div className="menu-divider"></div>

      <div className="menu-title">Add Child Node</div>
      {Object.entries(entityTypes).map(([key, entity]) => (
        <button key={key} className="menu-item" onClick={() => onAddChild(id, key)}>
          <i className={entity.icon} style={{ marginRight: '8px', color: entity.color, fontSize: '11px' }}></i>
          {entity.name}
        </button>
      ))}

      {availableTransforms && availableTransforms.length > 0 && (
        <>
          <div className="menu-divider"></div>
          <div className="menu-title">Transforms</div>
          {availableTransforms.map((t) => (
            <button key={t.id} className="menu-item transform-item" onClick={() => onRunTransform(id, t)}>
              <i className={t.icon} style={{ marginRight: '8px', color: '#f59e0b', fontSize: '11px' }}></i>
              {t.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

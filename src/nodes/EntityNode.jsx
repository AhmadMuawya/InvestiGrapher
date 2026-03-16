import React, { useState, useRef, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import './NodeStyles.css';

export default function EntityNode({ id, data, isConnectable }) {
  const { entity } = data;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipAbove, setTooltipAbove] = useState(true);
  const nodeRef = useRef(null);

  const filledAttrs = Object.entries(entity.attributes).filter(
    ([, v]) => v && String(v).trim() !== '',
  );

  // Flip tooltip below if node is near the top of viewport
  useEffect(() => {
    if (showTooltip && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipAbove(rect.top > 120);
    }
  }, [showTooltip]);

  return (
    <div
      ref={nodeRef}
      className="entity-node"
      style={{ '--node-color': entity.color }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ background: entity.color }}
      />

      <div className="node-icon-wrapper" style={{ borderColor: entity.color }}>
        <i className={entity.icon} style={{ color: entity.color, fontSize: '20px' }}></i>
      </div>
      <div className="node-name">{data.label || entity.name}</div>

      {showTooltip && filledAttrs.length > 0 && (
        <div className={`node-tooltip ${tooltipAbove ? 'tooltip-above' : 'tooltip-below'}`}>
          {filledAttrs.map(([key, value]) => (
            <div key={key} className="tooltip-row">
              <span className="tooltip-key">{key}:</span>
              <span className="tooltip-val">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ background: entity.color }}
      />
    </div>
  );
}

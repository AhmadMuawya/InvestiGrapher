import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './NodeStyles.css';

export default function CircleNode({ id, data, isConnectable }) {
  const onAddCircle = () => {
    if (data.onAddChild) {
      data.onAddChild(id, 'circle');
    }
  };

  const onAddRectangle = () => {
    if (data.onAddChild) {
      data.onAddChild(id, 'rectangle');
    }
  };

  return (
    <div className="custom-node circle">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ width: '10px', height: '10px', background: '#6366f1' }}
      />
      
      <div className="node-label">{data.label || 'Circle Node'}</div>
      
      <div className="btn-group">
        <button className="add-btn" onClick={onAddCircle} title="Add Circle">
          + ◯
        </button>
        <button className="add-btn rect" onClick={onAddRectangle} title="Add Rectangle">
          + ▭
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ width: '10px', height: '10px', background: '#6366f1' }}
      />
    </div>
  );
}

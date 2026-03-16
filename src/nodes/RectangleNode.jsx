import React from 'react';
import { Handle, Position } from '@xyflow/react';
import './NodeStyles.css';

export default function RectangleNode({ id, data, isConnectable }) {
  return (
    <div className="custom-node rectangle">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{ width: '10px', height: '10px', background: '#14b8a6' }}
      />
      
      <div className="node-label">{data.label || 'Rectangle Node'}</div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{ width: '10px', height: '10px', background: '#14b8a6' }}
      />
    </div>
  );
}

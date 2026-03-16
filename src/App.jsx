import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import EntityNode from './nodes/EntityNode';
import ContextMenu from './components/ContextMenu';
import EditModal from './components/EditModal';
import ConfirmDialog from './components/ConfirmDialog';
import entityTypes from './config/entityTypes.json';
import transformsDef from './config/transforms.json';
import { runTransform } from './transforms/index';
import './App.css';

const nodeTypes = { entity: EntityNode };

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: '#6366f1', strokeWidth: 2 },
};

function entityKeyById(id) {
  return Object.entries(entityTypes).find(([, e]) => e.id === id)?.[0];
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeCounter, setNodeCounter] = useState(1);
  const [menu, setMenu] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const flowRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds),
      ),
    [setEdges],
  );

  // Clamp menu position to viewport
  const menuPosition = (clientX, clientY) => {
    const menuW = 200, menuH = 320;
    const vw = window.innerWidth, vh = window.innerHeight;
    return {
      top: clientY + menuH > vh ? undefined : clientY,
      bottom: clientY + menuH > vh ? vh - clientY : undefined,
      left: clientX + menuW > vw ? undefined : clientX,
      right: clientX + menuW > vw ? vw - clientX : undefined,
    };
  };

  const onNodeDoubleClick = useCallback((event, node) => {
    event.stopPropagation();
    setEditModal({ nodeId: node.id, nodeData: node.data });
  }, []);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      const entityId = node.data.entity.id;
      const available = transformsDef.filter((t) => t.inputEntityIds.includes(entityId));

      setMenu({
        id: node.id,
        ...menuPosition(event.clientX, event.clientY),
        menuType: 'node',
        nodeData: node.data,
        availableTransforms: available,
      });
    },
    [],
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const flowPosition = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setMenu({
        ...menuPosition(event.clientX, event.clientY),
        menuType: 'canvas',
        canvasPosition: flowPosition,
      });
    },
    [screenToFlowPosition],
  );

  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleEditEntity = useCallback((nodeId, nodeData) => {
    setMenu(null);
    setEditModal({ nodeId, nodeData });
  }, []);

  const handleDeleteEntity = useCallback(
    (nodeId) => {
      setMenu(null);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodes, setEdges],
  );

  // BFS to collect and remove all descendants
  const handleDeleteDescendants = useCallback(
    (nodeId) => {
      setMenu(null);
      const descendants = new Set();
      const queue = [nodeId];
      while (queue.length > 0) {
        const current = queue.shift();
        edges
          .filter((e) => e.source === current)
          .forEach((e) => {
            if (!descendants.has(e.target)) {
              descendants.add(e.target);
              queue.push(e.target);
            }
          });
      }
      if (descendants.size === 0) return;
      setNodes((nds) => nds.filter((n) => !descendants.has(n.id)));
      setEdges((eds) => eds.filter((e) => !descendants.has(e.source) && !descendants.has(e.target)));
    },
    [edges, setNodes, setEdges],
  );

  const handleAddChild = useCallback(
    (parentId, entityKey) => {
      setMenu(null);
      const parentNode = nodes.find((n) => n.id === parentId);
      if (!parentNode) return;

      const existingChildren = edges.filter((e) => e.source === parentId);
      const spread = 120;
      const index = existingChildren.length;
      const xOffset = index === 0 ? 0 : index % 2 === 0 ? (index / 2) * spread : -Math.ceil(index / 2) * spread;

      const newId = `${nodeCounter}`;
      const entityDef = entityTypes[entityKey];
      const newNode = {
        id: newId,
        type: 'entity',
        position: { x: parentNode.position.x + xOffset, y: parentNode.position.y + 140 },
        data: { entity: { ...entityDef }, label: `${entityDef.name} ${nodeCounter}` },
      };

      setNodeCounter((c) => c + 1);
      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) =>
        addEdge(
          { id: `e${parentId}-${newId}`, source: parentId, target: newId, animated: true, style: { stroke: entityDef.color, strokeWidth: 2 } },
          eds,
        ),
      );
    },
    [nodes, edges, nodeCounter, setNodes, setEdges],
  );

  const handleAddStandalone = useCallback(
    (entityKey, position) => {
      setMenu(null);
      const newId = `${nodeCounter}`;
      const entityDef = entityTypes[entityKey];
      setNodeCounter((c) => c + 1);
      setNodes((nds) => [
        ...nds,
        { id: newId, type: 'entity', position, data: { entity: { ...entityDef }, label: `${entityDef.name} ${nodeCounter}` } },
      ]);
    },
    [nodeCounter, setNodes],
  );

  // Auto-updates label to "First Last" when both name fields are present
  const handleSaveEdit = useCallback(
    (nodeId, newLabel, newAttrs) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          let finalLabel = newLabel;
          if (newAttrs.first_name && newAttrs.last_name) {
            finalLabel = `${newAttrs.first_name} ${newAttrs.last_name}`;
          } else if (newAttrs.first_name) {
            finalLabel = newAttrs.first_name;
          }
          return { ...n, data: { ...n.data, label: finalLabel, entity: { ...n.data.entity, attributes: { ...newAttrs } } } };
        }),
      );
      setEditModal(null);
    },
    [setNodes],
  );

  const handleRunTransform = useCallback(
    async (sourceNodeId, transformDef) => {
      setMenu(null);
      setLoading(true);

      const sourceNode = nodes.find((n) => n.id === sourceNodeId);
      if (!sourceNode) { setLoading(false); return; }

      try {
        const results = await runTransform(transformDef.functionName, sourceNode.data.entity.attributes);

        if (!results || results.length === 0) {
          alert('No results found.');
          setLoading(false);
          return;
        }

        const outKey = entityKeyById(transformDef.outputEntityId);
        const outEntityDef = entityTypes[outKey];
        if (!outEntityDef) { setLoading(false); return; }

        let counter = nodeCounter;
        const newNodes = [];
        const newEdges = [];

        results.forEach((record, idx) => {
          const newId = `${counter}`;
          const spread = 120;
          const xOffset = idx === 0 ? 0 : idx % 2 === 0 ? (idx / 2) * spread : -Math.ceil(idx / 2) * spread;

          // Merge template + all record keys (supports dynamic OI Module attrs)
          const attrs = { ...outEntityDef.attributes };
          for (const [key, val] of Object.entries(record)) {
            if (val !== undefined && val !== null && val !== '') attrs[key] = String(val);
          }

          let label = `${outEntityDef.name} ${counter}`;
          if (attrs.first_name && attrs.last_name) {
            label = `${attrs.first_name} ${attrs.last_name}`;
          } else if (attrs.first_name) {
            label = attrs.first_name;
          } else if (attrs.module) {
            label = attrs.module;
          } else if (attrs[outEntityDef.searchKey]) {
            label = attrs[outEntityDef.searchKey];
          } else if (attrs.reference_number) {
            label = attrs.reference_number;
          }

          newNodes.push({
            id: newId,
            type: 'entity',
            position: {
              x: sourceNode.position.x + xOffset,
              y: sourceNode.position.y + 160,
            },
            data: { entity: { ...outEntityDef, attributes: attrs }, label },
          });

          newEdges.push({
            id: `e${sourceNodeId}-${newId}`,
            source: sourceNodeId,
            target: newId,
            animated: true,
            style: { stroke: outEntityDef.color, strokeWidth: 2 },
          });

          counter++;
        });

        setNodeCounter(counter);
        setNodes((nds) => [...nds, ...newNodes]);
        setEdges((eds) => {
          let updated = eds;
          for (const e of newEdges) {
            updated = addEdge(e, updated);
          }
          return updated;
        });
      } catch (err) {
        alert(`Transform failed: ${err.message}`);
      }

      setLoading(false);
    },
    [nodes, nodeCounter, setNodes, setEdges],
  );

  const handleDeleteAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);
    setConfirmDialog(false);
  }, [setNodes, setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0f172a' }} ref={flowRef}>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Running transform…</span>
          </div>
        </div>
      )}

      {nodes.length === 0 && (
        <div className="empty-hint">
          <i className="fa-solid fa-diagram-project"></i>
          <span>Right-click to add entities</span>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Controls />
        <MiniMap zoomable pannable />
        <Background variant="dots" gap={12} size={1} color="#475569" />
      </ReactFlow>

      <button className="delete-all-btn" onClick={() => setConfirmDialog(true)} title="Delete All">
        <i className="fa-solid fa-trash"></i>
      </button>

      {menu && (
        <ContextMenu
          {...menu}
          onAddChild={handleAddChild}
          onEditEntity={handleEditEntity}
          onDeleteEntity={handleDeleteEntity}
          onDeleteDescendants={handleDeleteDescendants}
          onAddStandalone={handleAddStandalone}
          onRunTransform={handleRunTransform}
          onClose={() => setMenu(null)}
          entityTypes={entityTypes}
        />
      )}

      {editModal && (
        <EditModal
          nodeId={editModal.nodeId}
          nodeData={editModal.nodeData}
          onSave={handleSaveEdit}
          onClose={() => setEditModal(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          message="Are you sure you want to delete all nodes and edges? This cannot be undone."
          onConfirm={handleDeleteAll}
          onCancel={() => setConfirmDialog(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

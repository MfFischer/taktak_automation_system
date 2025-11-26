import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play } from 'lucide-react';
import toast from 'react-hot-toast';

import { NodeType } from '@taktak/types';
import CustomNode from './CustomNode';
import NodePalette from './NodePalette';
import NodeConfigPanel from './NodeConfigPanel';
import WorkflowControls from './WorkflowControls';
import NodeSearch from './NodeSearch';

const nodeTypes = {
  custom: CustomNode,
};

interface WorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onExecute?: () => void;
  onChange?: (nodes: Node[], edges: Edge[]) => void;
}

export default function WorkflowCanvas({
  workflowId: _workflowId,
  initialNodes = [],
  initialEdges = [],
  onSave,
  onExecute,
  onChange,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);

  // Update nodes when initialNodes change
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  // Update edges when initialEdges change
  useEffect(() => {
    if (initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  // Notify parent of changes for auto-save
  useEffect(() => {
    if (onChange && (nodes.length > 0 || edges.length > 0)) {
      onChange(nodes, edges);
    }
  }, [nodes, edges, onChange]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowConfigPanel(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowConfigPanel(false);
  }, []);

  const handleUpdateNodeConfig = useCallback(
    (nodeId: string, newConfig: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newConfig.label || node.data.label,
                config: newConfig,
              },
            };
          }
          return node;
        })
      );
      toast.success('Node configuration updated');
    },
    [setNodes]
  );

  const handleAddNode = useCallback(
    (type: NodeType) => {
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position: { x: 250, y: 100 + nodes.length * 100 },
        data: {
          label: type.replace(/_/g, ' '),
          nodeType: type,
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
      toast.success(`Added ${type.replace(/_/g, ' ')} node`);
    },
    [nodes.length, setNodes]
  );

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(nodes, edges);
      toast.success('Workflow saved successfully');
    }
  }, [nodes, edges, onSave]);

  const handleExecute = useCallback(() => {
    if (onExecute) {
      onExecute();
      toast.success('Workflow execution started');
    }
  }, [onExecute]);

  const handleDeleteNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id)
      );
      setSelectedNode(null);
      toast.success('Node deleted');
    }
  }, [selectedNode, setNodes, setEdges]);

  return (
    <ReactFlowProvider>
      <div className="h-full w-full flex">
        {/* Node Palette */}
        <NodePalette onAddNode={handleAddNode} />

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />

          {/* Node Search */}
          <NodeSearch nodes={nodes} />

          {/* Workflow Controls (Zoom, Minimap Toggle) */}
          <WorkflowControls
            showMinimap={showMinimap}
            onToggleMinimap={() => setShowMinimap(!showMinimap)}
          />

          {/* Minimap (conditionally rendered) */}
          {showMinimap && (
            <MiniMap
              nodeColor={(node) => {
                const nodeType = node.data.nodeType as NodeType;
                if (nodeType === NodeType.SCHEDULE) return '#10b981';
                if (nodeType === NodeType.SEND_SMS || nodeType === NodeType.SEND_EMAIL)
                  return '#3b82f6';
                if (nodeType === NodeType.CONDITION) return '#f59e0b';
                if (nodeType === NodeType.AI_GENERATE) return '#8b5cf6';
                return '#6b7280';
              }}
              position="bottom-left"
            />
          )}

          {/* Action Panel */}
          <Panel position="top-right" className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary flex items-center gap-2"
              disabled={!onSave}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              type="button"
              onClick={handleExecute}
              className="btn btn-secondary flex items-center gap-2"
              disabled={!onExecute}
            >
              <Play className="w-4 h-4" />
              Execute
            </button>
          </Panel>

          {/* Selected Node Actions */}
          {selectedNode && !showConfigPanel && (
            <Panel position="top-left" className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
              <h3 className="font-medium mb-2">
                {selectedNode.data.label}
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigPanel(true)}
                  className="btn btn-primary text-sm"
                >
                  Configure
                </button>
                <button
                  type="button"
                  onClick={handleDeleteNode}
                  className="btn btn-danger text-sm"
                >
                  Delete Node
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      {/* Node Configuration Panel */}
      {showConfigPanel && selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setShowConfigPanel(false)}
          onUpdate={handleUpdateNodeConfig}
        />
      )}
      </div>
    </ReactFlowProvider>
  );
}


/**
 * Guest Workflow Page
 * Try workflows without signing up (read-only mode)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function GuestWorkflow() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    // Load template from session storage
    const guestTemplateStr = sessionStorage.getItem('guestTemplate');
    if (guestTemplateStr) {
      const template = JSON.parse(guestTemplateStr);
      setTemplateName(template.name);

      // Convert to ReactFlow format
      const flowNodes: Node[] = template.nodes.map((node: any) => ({
        id: node.id,
        type: 'default',
        position: node.position || { x: 0, y: 0 },
        data: {
          label: (
            <div className="px-4 py-2">
              <div className="font-semibold">{node.name}</div>
              <div className="text-xs text-gray-500">{node.type}</div>
              {node.description && (
                <div className="text-xs text-gray-400 mt-1">{node.description}</div>
              )}
            </div>
          ),
        },
      }));

      const flowEdges: Edge[] = template.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } else {
      navigate('/');
    }

    // Show signup prompt after 30 seconds
    const timer = setTimeout(() => {
      setShowSignupPrompt(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSignup = () => {
    navigate('/register');
  };

  const handleExecute = () => {
    setShowSignupPrompt(true);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Guest Mode Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👀</span>
          <div>
            <div className="font-semibold">Guest Mode - Preview Only</div>
            <div className="text-sm opacity-90">
              Sign up to save, edit, and execute workflows
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignup}
          className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
        >
          Sign Up Free
        </button>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls showInteractive={false} />
          <MiniMap position="bottom-left" />

          <Panel position="top-right" className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Home
            </button>
            <button
              type="button"
              onClick={handleExecute}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              🔒 Execute (Sign up required)
            </button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Signup Prompt Modal */}
      {showSignupPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Build Your Own Workflows?
              </h2>
              <p className="text-gray-600 mb-6">
                Sign up for free to create, save, and execute unlimited workflows with our powerful automation platform.
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSignup}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Sign Up Free - No Credit Card Required
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignupPrompt(false)}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


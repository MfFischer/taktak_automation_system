/**
 * Node Search Component
 * Allows searching and filtering nodes in the workflow
 */

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Node, useReactFlow } from 'reactflow';

interface NodeSearchProps {
  nodes: Node[];
}

export default function NodeSearch({ nodes }: NodeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { setCenter } = useReactFlow();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNodes([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = nodes.filter((node) => {
      const label = node.data?.label?.toLowerCase() || '';
      const nodeType = node.data?.nodeType?.toLowerCase() || '';
      return label.includes(query) || nodeType.includes(query);
    });

    setFilteredNodes(filtered);
  }, [searchQuery, nodes]);

  const handleNodeClick = (node: Node) => {
    // Center the view on the selected node
    if (node.position) {
      setCenter(node.position.x + 100, node.position.y + 50, {
        zoom: 1.5,
        duration: 500,
      });
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 w-96">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search nodes..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isOpen && filteredNodes.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {filteredNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => handleNodeClick(node)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">{node.data?.label || 'Unnamed Node'}</div>
              <div className="text-sm text-gray-500 mt-1">
                Type: {node.data?.nodeType || 'Unknown'}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {isOpen && searchQuery && filteredNodes.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3">
          <p className="text-gray-500 text-sm">No nodes found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}


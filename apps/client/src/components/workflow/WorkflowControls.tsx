/**
 * Workflow Editor Controls
 * Provides zoom, fit view, and minimap toggle controls
 */

import { ZoomIn, ZoomOut, Maximize2, Map } from 'lucide-react';
import { useReactFlow } from 'reactflow';

interface WorkflowControlsProps {
  showMinimap: boolean;
  onToggleMinimap: () => void;
}

export default function WorkflowControls({ showMinimap, onToggleMinimap }: WorkflowControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      {/* Zoom In */}
      <button
        onClick={() => zoomIn()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-gray-700" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={() => zoomOut()}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-gray-700" />
      </button>

      {/* Fit View */}
      <button
        onClick={() => fitView({ padding: 0.2, duration: 300 })}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Fit to Screen"
      >
        <Maximize2 className="w-5 h-5 text-gray-700" />
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1" />

      {/* Toggle Minimap */}
      <button
        onClick={onToggleMinimap}
        className={`p-2 rounded transition-colors ${
          showMinimap ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-700'
        }`}
        title="Toggle Minimap"
      >
        <Map className="w-5 h-5" />
      </button>
    </div>
  );
}


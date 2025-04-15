import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DesignWorkspaceProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  undo: () => void;
  redo: () => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  view: string;
  setView: (view: string) => void;
  currentDesignName: string;
  setCurrentDesignName: (name: string) => void;
  selectedObj: fabric.Object | null;
  canvas: fabric.Canvas | null;
  toggleTutorial: () => void;
}

export default function DesignWorkspace({
  canvasRef,
  undo,
  redo,
  zoom,
  setZoom,
  view,
  setView,
  currentDesignName,
  setCurrentDesignName,
  selectedObj,
  canvas,
  toggleTutorial
}: DesignWorkspaceProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

  const zoomIn = () => {
    if (zoom < 200) {
      setZoom(zoom + 10);
    }
  };

  const zoomOut = () => {
    if (zoom > 50) {
      setZoom(zoom - 10);
    }
  };

  const handleViewChange = (newView: string) => {
    setView(newView);
  };

  const handleDesignNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDesignName(e.target.value);
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Workspace controls */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button 
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" 
            onClick={undo}
            aria-label="Undo"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
            </svg>
          </button>
          <button 
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" 
            onClick={redo}
            aria-label="Redo"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
            </svg>
          </button>
          <div className="h-6 border-r border-neutral-200 dark:border-neutral-700 mx-1"></div>
          
          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="text-sm bg-neutral-100 dark:bg-neutral-800 border-0 rounded w-32">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Front">Front View</SelectItem>
              <SelectItem value="Back">Back View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center">
          <input 
            type="text" 
            value={currentDesignName} 
            onChange={handleDesignNameChange}
            className="text-center bg-transparent border-0 font-medium focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none px-2 py-1"
            aria-label="Design Name"
          />
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" 
            onClick={zoomOut}
            aria-label="Zoom Out"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" />
            </svg>
          </button>
          <span className="text-sm font-medium">{zoom}%</span>
          <button 
            className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" 
            onClick={zoomIn}
            aria-label="Zoom In"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm2.5-4h-2v2H9v-2H7V9h2V7h1v2h2v1z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Canvas area */}
      <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-4 overflow-auto">
        <div 
          ref={canvasContainerRef}
          className="relative bg-white dark:bg-neutral-900 shadow-md rounded-md" 
          style={{ 
            width: `${canvasSize.width}px`, 
            height: `${canvasSize.height}px`, 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center'
          }}
        >
          {/* Canvas element */}
          <canvas 
            ref={canvasRef} 
            id="vinylCanvas" 
            width={canvasSize.width} 
            height={canvasSize.height} 
            className="w-full h-full"
          />
          
          {/* Grid overlay (shown when zoom > 100%) */}
          {zoom > 100 && (
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <div className="grid grid-cols-12 h-full">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="border-r border-dashed border-neutral-400"></div>
                ))}
              </div>
              <div className="grid grid-rows-8 w-full h-full">
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className="border-b border-dashed border-neutral-400"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Status bar */}
      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 py-1 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
        <div>Size: {canvasSize.width}px × {canvasSize.height}px</div>
        <div>
          <button 
            className="hover:text-primary transition-colors" 
            onClick={toggleTutorial}
          >
            Need help? View Tutorial
          </button>
        </div>
        <div>
          {selectedObj ? (
            selectedObj.type === 'text' 
              ? `Text: "${(selectedObj as fabric.Text).text.substring(0, 10)}${(selectedObj as fabric.Text).text.length > 10 ? '...' : ''}"` 
              : `${selectedObj.type || 'Object'} selected`
          ) : 'No selection'}
        </div>
      </div>
    </div>
  );
}

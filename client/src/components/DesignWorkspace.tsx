import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Toolbar from "@/components/Toolbar"; 
import FontShowcase from "@/components/FontShowcase"; 
import FontCarouselPicker from "@/components/FontCarouselPicker";
import FontGallery from "@/components/FontGallery";
import GitHubFontPreviewer from "@/components/GitHubFontPreviewer";
import googleFontsService from "@/lib/googleFontsService";
import { loadFontBatch, isFontLoaded } from "@/lib/fontLoader"; 


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
  toggleVinylProperties?: () => void;
  dimensions?: { width: number, height: number } | null;
  selectedSizeId?: number | null;
  selectedMaterialId?: number | null;
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
  toggleTutorial,
  toggleVinylProperties,
  dimensions,
  selectedSizeId,
  selectedMaterialId
}: DesignWorkspaceProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [showFontShowcase, setShowFontShowcase] = useState(false);
  const [showFontGallery, setShowFontGallery] = useState(true); 

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

  const handleAddImage = () => {
  };

  const getCurrentFont = useCallback(() => {
    const activeObject = canvas?.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      return (activeObject as fabric.Textbox).fontFamily || '';
    }
    return '';
  }, [canvas]);

  const handleFontSelection = async (fontFamily: string) => {
    const activeObject = canvas?.getActiveObject();
    if (!activeObject || activeObject.type !== 'textbox') return;

    if (!isFontLoaded(fontFamily)) {
      try {
        await loadFontBatch([fontFamily]);
      } catch (error) {
        console.error(`Error loading font ${fontFamily}:`, error);
      }
    }

    (activeObject as fabric.Textbox).set({
      fontFamily: fontFamily
    });

    canvas?.renderAll();
  };

  const toggleFontShowcase = () => {
    setShowFontShowcase(!showFontShowcase);
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            value={currentDesignName} 
            onChange={handleDesignNameChange}
            className="text-center bg-transparent border-0 font-medium focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none px-2 py-1"
            aria-label="Design Name"
          />
          {toggleVinylProperties && (
            <button
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-primary"
              onClick={toggleVinylProperties}
              title="Vinyl Properties"
              aria-label="Vinyl Properties"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 18L5 21L2 18" />
                <path d="M5 16V4.5C5 3.67 5.67 3 6.5 3H10" />
                <rect x="12" y="3" width="8" height="6" rx="2" />
                <path d="M16 22L19 19L22 22" />
                <path d="M19 16V9" />
                <rect x="9" y="13" width="8" height="6" rx="2" />
              </svg>
            </button>
          )}
        </div>
        
        {showFontShowcase && ( 
          <FontShowcase 
            isOpen={showFontShowcase} 
            onSelectFont={handleFontSelection} 
            onClose={toggleFontShowcase}
            currentFont={getCurrentFont() || ""}
          />
        )}

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
          <canvas 
            ref={canvasRef} 
            id="vinylCanvas" 
            width={canvasSize.width} 
            height={canvasSize.height} 
            className="w-full h-full"
          />

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

      <div className="px-4">
        <FontGallery
          visible={showFontGallery}
          currentFont={getCurrentFont() || "Arial"}
          onFontSelected={handleFontSelection}
          sampleText={selectedObj && selectedObj.type === 'text' ? (selectedObj as fabric.Text).text : "Sample Text"}
        />
        
        <div className="mt-4 mb-4">
          <GitHubFontPreviewer
            onFontSelected={handleFontSelection}
            defaultText={selectedObj && selectedObj.type === 'text' ? (selectedObj as fabric.Text).text : "Sample Text"}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-4 py-1 flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400">
        <div>Size: {canvasSize.width}px × {canvasSize.height}px</div>
        <div className="flex items-center space-x-4">
          <button 
            className="hover:text-primary transition-colors" 
            onClick={toggleTutorial}
          >
            Need help? View Tutorial
          </button>
          <div className="flex space-x-4">
            <button 
              className={`hover:text-primary transition-colors ${showFontGallery ? 'text-primary' : ''}`}
              onClick={() => setShowFontGallery(!showFontGallery)}
            >
              {showFontGallery ? 'Hide Font Gallery' : 'Show Font Gallery'}
            </button>
          </div>
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
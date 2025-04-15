import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Layer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  obj: fabric.Object;
}

interface LayersPanelProps {
  layers: Layer[];
  showLayersPanel: boolean;
  setShowLayersPanel: (show: boolean) => void;
  canvas: fabric.Canvas | null;
  selectObject: (obj: fabric.Object | null) => void;
}

export default function LayersPanel({
  layers,
  showLayersPanel,
  setShowLayersPanel,
  canvas,
  selectObject
}: LayersPanelProps) {
  
  const toggleLayerVisibility = (layer: Layer) => {
    if (!canvas) return;
    
    layer.obj.set('visible', !layer.obj.visible);
    canvas.renderAll();
  };

  const toggleLayerLock = (layer: Layer) => {
    if (!canvas) return;
    
    layer.obj.set('selectable', !layer.locked);
    layer.obj.set('evented', !layer.locked);
    canvas.renderAll();
  };

  const selectLayer = (layer: Layer) => {
    if (!canvas) return;
    
    canvas.setActiveObject(layer.obj);
    canvas.renderAll();
    selectObject(layer.obj);
  };

  return (
    <div 
      className={`fixed right-0 bottom-0 top-0 w-64 bg-white dark:bg-neutral-900 shadow-lg z-10 transform transition-transform ${
        showLayersPanel ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="font-medium">Layers</h3>
          <button 
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" 
            onClick={() => setShowLayersPanel(false)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {layers.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
              <p>No layers yet.</p>
              <p className="text-sm mt-1">Add elements to your design to see them here.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {layers.map((layer) => (
                <li 
                  key={layer.id} 
                  className={`p-2 rounded flex items-center group cursor-pointer ${
                    canvas?.getActiveObject() === layer.obj 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => selectLayer(layer)}
                >
                  <button 
                    className="mr-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-white" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer);
                    }}
                  >
                    {layer.visible ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 truncate text-sm">{layer.name}</div>
                  <button 
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-white" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerLock(layer);
                    }}
                  >
                    {layer.locked ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

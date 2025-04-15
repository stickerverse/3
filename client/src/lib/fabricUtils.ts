import { fabric } from "fabric";
import { tintColor } from "./colorUtils";

interface EffectOptions {
  strokeColor?: string;
  color?: string;
}

// Initialize a Fabric.js canvas with default settings
export function initializeCanvas(canvasElement: HTMLCanvasElement): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasElement, {
    preserveObjectStacking: true,
    stopContextMenu: true,
    fireRightClick: true,
    selection: true,
    backgroundColor: "#fff"
  });

  return canvas;
}

// Apply a text effect to an object
export function applyTextEffect(obj: fabric.Object, effectName: string, options: EffectOptions = {}): void {
  if (!obj || obj.type !== 'text') return;
  
  // Remove previous effects
  removeTextEffect(obj);
  
  // Apply selected effect
  switch(effectName) {
    case 'shadow':
      obj.set({
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.3)',
          blur: 10,
          offsetX: 5,
          offsetY: 5
        })
      });
      break;
      
    case 'glow':
      obj.set({
        shadow: new fabric.Shadow({
          color: 'rgba(100,200,255,0.7)',
          blur: 15,
          offsetX: 0,
          offsetY: 0
        })
      });
      break;
      
    case 'gradient':
      if (options.color) {
        // This is a simplified version since fabric.js gradient is more complex
        const gradient = new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: 0,
            y1: 0,
            x2: (obj as fabric.Text).width || 200,
            y2: (obj as fabric.Text).height || 50
          },
          colorStops: [
            { offset: 0, color: options.color },
            { offset: 1, color: tintColor(options.color, 0.7) }
          ]
        });
        obj.set({ fill: gradient });
      }
      break;
      
    case 'retro':
      obj.set({
        stroke: options.strokeColor || '#000',
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: 'rgba(255,200,100,0.5)',
          blur: 15,
          offsetX: 3,
          offsetY: 3
        })
      });
      break;
      
    case 'metallic':
      // Simplified metallic effect
      obj.set({
        fill: '#A5A5A5',
        stroke: '#333',
        strokeWidth: 1,
        shadow: new fabric.Shadow({
          color: 'rgba(255,255,255,0.5)',
          blur: 3,
          offsetX: -1,
          offsetY: -1
        })
      });
      break;
      
    case 'outline':
      obj.set({
        stroke: options.strokeColor || '#000000',
        strokeWidth: 2
      });
      break;
      
    case 'distressed':
      // For a distressed effect, we would ideally use a filter
      // This is a placeholder for future implementation
      obj.set({
        stroke: '#333',
        strokeWidth: 0.5,
        strokeDashArray: [3, 2]
      });
      break;
      
    default:
      // No effect or reset
      break;
  }
}

// Remove text effects from an object
export function removeTextEffect(obj: fabric.Object): void {
  obj.set({
    shadow: null
  });
}

// Generate a unique ID for canvas objects
export function generateUniqueId(prefix: string = 'obj'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// Center an object on the canvas
export function centerObjectOnCanvas(canvas: fabric.Canvas, obj: fabric.Object): void {
  const objCenter = obj.getCenterPoint();
  const canvasCenter = new fabric.Point(canvas.width! / 2, canvas.height! / 2);
  
  const deltaX = canvasCenter.x - objCenter.x;
  const deltaY = canvasCenter.y - objCenter.y;
  
  obj.set({
    left: (obj.left || 0) + deltaX,
    top: (obj.top || 0) + deltaY
  });
  
  canvas.renderAll();
}

// Clone an object with all its properties
export function cloneObject(obj: fabric.Object, callback: (cloned: fabric.Object) => void): void {
  obj.clone((cloned: fabric.Object) => {
    cloned.set({
      left: (obj.left || 0) + 20,
      top: (obj.top || 0) + 20,
      id: generateUniqueId(obj.type)
    });
    
    callback(cloned);
  });
}

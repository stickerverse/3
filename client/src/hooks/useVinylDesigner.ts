import { useState, useEffect, useRef } from "react";
import { fabric } from "fabric";
import { useToast } from "@/hooks/use-toast";
import { textEffects } from "@/lib/textEffects";
import { designTemplates } from "@/lib/designTemplates";
import { DesignTemplate } from "@/types/vinyl";
import { tintColor } from "@/lib/colorUtils";
import { applyTextEffect, initializeCanvas, removeTextEffect } from "@/lib/fabricUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { fontCategories, loadAllFonts, getFontSamples, loadFontsByCategory } from "@/lib/fontLoader";
import WebFont from "webfontloader";

export default function useVinylDesigner() {
  // State management
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [color, setColor] = useState("#e74c3c");
  const [text, setText] = useState("Your Text Here");
  const [font, setFont] = useState("Anton");
  const [fontSize, setFontSize] = useState(40);
  const [selectedObj, setSelectedObj] = useState<fabric.Object | null>(null);
  const [opacity, setOpacity] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [view, setView] = useState("Front");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [uiMode, setUiMode] = useState("Advanced UI");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [textEffect, setTextEffect] = useState("none");
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [appliedEffects, setAppliedEffects] = useState<string[]>([]);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showToolTips, setShowToolTips] = useState(true);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [currentDesignName, setCurrentDesignName] = useState("Untitled Design");
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const [layers, setLayers] = useState<any[]>([]);
  const [clipboard, setClipboard] = useState<any | null>(null);
  const [canvasState, setCanvasState] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  
  // Initialize Google Fonts
  useEffect(() => {
    // Load initial batch of fonts for the UI
    const loadInitialFonts = async () => {
      try {
        // Fetch font data from Google Fonts API
        await fetchGoogleFonts();
        
        // Load sample fonts from each category for initial rendering
        const fontSamples = getFontSamples(2);
        await loadFontBatch(fontSamples);
        
        // Start loading popular fonts in the background
        loadAllFonts().catch(err => {
          console.error('Failed to load all fonts:', err);
        });
        
        console.log('Initial fonts loaded successfully');
      } catch (error) {
        console.error('Error loading initial fonts:', error);
      }
    };
    
    loadInitialFonts();
    
    // Show toast to notify user about Google Fonts integration
    toast({
      title: "Google Fonts Integration",
      description: "Access to 1,000+ beautiful fonts is now available in the font selector!",
      duration: 5000,
    });
  }, []);
  
  // Initialize canvas with advanced options
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvasInstance = initializeCanvas(canvasRef.current);
    
    // Set up event handlers
    canvasInstance.on("selection:created", handleSelection);
    canvasInstance.on("selection:updated", handleSelection);
    canvasInstance.on("selection:cleared", () => setSelectedObj(null));
    
    // Register object modification events for undo/redo
    canvasInstance.on("object:modified", saveToHistory);
    canvasInstance.on("object:added", saveToHistory);
    canvasInstance.on("object:removed", saveToHistory);
    
    // Enable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        } else if (e.key === 'c') {
          e.preventDefault();
          copySelectedObject();
        } else if (e.key === 'v') {
          e.preventDefault();
          pasteObject();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && 
            document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteSelectedObject();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Initialize with a welcome text
    const welcomeText = new fabric.Text('Create Your Vinyl Design', {
      left: 300,
      top: 200,
      fontFamily: 'Bebas Neue',
      fontSize: 36,
      fill: '#3498db',
      originX: 'center',
      originY: 'center',
      textAlign: 'center'
    });
    
    canvasInstance.add(welcomeText);
    canvasInstance.centerObject(welcomeText);
    canvasInstance.renderAll();
    
    // Animate welcome text to fade in
    welcomeText.set({ opacity: 0 });
    (function fadeIn() {
      welcomeText.set('opacity', (welcomeText.opacity || 0) + 0.05);
      canvasInstance.renderAll();
      if ((welcomeText.opacity || 0) < 1) {
        requestAnimationFrame(fadeIn);
      }
    })();
    
    // Set the initial canvas
    setCanvas(canvasInstance);
    
    // Update layers when canvas is initialized
    updateLayers(canvasInstance);
    
    // Check if tutorial has been shown before
    const tutorialHidden = localStorage.getItem('vinyl-studio-tutorial-hidden');
    if (!tutorialHidden) {
      setShowTutorial(true);
    }
    
    // Clean up function when component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvasInstance.dispose();
    };
  }, []);

  // Save state to history for undo/redo
  const saveToHistory = () => {
    if (!canvas) return;
    
    // Save current canvas state
    const jsonState = JSON.stringify(canvas.toJSON(['id']));
    setCanvasState(jsonState);
    setUndoStack(prev => [...prev, jsonState]);
    
    // Clear redo stack when a new action is performed
    setRedoStack([]);
    
    // Update layers
    updateLayers(canvas);
  };
  
  // Update layers panel with current objects
  const updateLayers = (canvasInstance: fabric.Canvas) => {
    if (!canvasInstance) return;
    
    const objects = canvasInstance.getObjects();
    const layersData = objects.map((obj, index) => {
      const objWithId = obj as any;
      return {
        id: objWithId.id || `layer-${index}`,
        name: objWithId.name || (obj.type === 'text' ? `Text: ${(obj as fabric.Text).text.substring(0, 10)}...` : `${obj.type}-${index}`),
        type: obj.type || 'object',
        visible: obj.visible !== false,
        locked: obj.selectable === false,
        obj
      };
    }).reverse(); // Reverse to match visual stacking order
    
    setLayers(layersData);
  };

  // Handle object selection with extended properties
  const handleSelection = (e: any) => {
    if (!e.selected || e.selected.length === 0) return;
    
    const obj = e.selected[0];
    if (obj && obj.type === "text") {
      setSelectedObj(obj);
      setText((obj as fabric.Text).text || "");
      setFont(obj.fontFamily || "Anton");
      setFontSize(obj.fontSize || 40);
      setColor(obj.fill?.toString() || "#000000");
      setOpacity(obj.opacity !== undefined ? obj.opacity * 100 : 100);
      setStrokeColor(obj.stroke || "#000000");
      setStrokeWidth(obj.strokeWidth || 0);
      
      // Detect applied effects
      const effects: string[] = [];
      if (obj.shadow) effects.push("shadow");
      if (obj.strokeWidth && obj.strokeWidth > 0) effects.push("outline");
      if (obj.fill && typeof obj.fill === 'object') effects.push("gradient");
      setAppliedEffects(effects);
      
      // Set text effect based on detected effects
      if (effects.length > 0) {
        setTextEffect(effects[0]);
      } else {
        setTextEffect("none");
      }
    } else if (obj) {
      setSelectedObj(obj);
      setColor(obj.fill?.toString() || "#000000");
      setOpacity(obj.opacity !== undefined ? obj.opacity * 100 : 100);
      setStrokeColor(obj.stroke || "#000000");
      setStrokeWidth(obj.strokeWidth || 0);
    } else {
      setSelectedObj(null);
    }
  };

  // Add text to canvas with animation
  const addText = () => {
    if (!canvas) return;
    
    setSelectedTool("text");

    // Create unique ID for the object
    const id = `text-${Date.now()}`;

    const textObj = new fabric.Text(text, {
      id,
      name: `Text: ${text.substring(0, 10)}...`,
      fill: color,
      fontFamily: font,
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize,
      opacity: 0, // Start with opacity 0 for animation
      originX: 'center',
      originY: 'center',
      stroke: strokeWidth > 0 ? strokeColor : undefined,
      strokeWidth: strokeWidth
    });

    // Apply text effects if selected
    if (textEffect !== 'none') {
      applyTextEffect(textObj, textEffect, { strokeColor, color });
    }

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    
    // Animated entrance
    (function fadeIn() {
      textObj.set('opacity', (textObj.opacity || 0) + 0.1);
      canvas.renderAll();
      if ((textObj.opacity || 0) < opacity / 100) {
        requestAnimationFrame(fadeIn);
      } else {
        textObj.set('opacity', opacity / 100);
        canvas.renderAll();
        saveToHistory();
      }
    })();
    
    setSelectedObj(textObj);
    selectObject(textObj);
  };
  
  // Function to add shapes (placeholder for future implementation)
  const addShape = () => {
    if (!canvas) return;
    
    setSelectedTool("shape");
    toast({
      title: "Shape Tool",
      description: "Shape functionality is coming soon!",
    });
  };
  
  // Function to add images (placeholder for future implementation)
  const addImage = () => {
    if (!canvas) return;
    
    setSelectedTool("image");
    toast({
      title: "Image Tool",
      description: "Image import functionality is coming soon!",
    });
  };
  
  // Function to toggle settings panel (placeholder for future implementation)
  const toggleSettings = () => {
    setSelectedTool("settings");
    toast({
      title: "Settings",
      description: "Settings panel is coming soon!",
    });
  };
  
  // Select an object and update the sidebar
  const selectObject = (obj: fabric.Object | null) => {
    if (!canvas) return;
    
    if (obj) {
      canvas.setActiveObject(obj);
      setSelectedObj(obj);
      
      if (obj.type === 'text') {
        setText((obj as fabric.Text).text || "");
        setFont(obj.fontFamily || "Anton");
        setFontSize(obj.fontSize || 40);
      }
      
      setColor(obj.fill?.toString() || "#000000");
      setOpacity(obj.opacity !== undefined ? obj.opacity * 100 : 100);
    } else {
      canvas.discardActiveObject();
      setSelectedObj(null);
    }
    
    canvas.renderAll();
  };
  
  // Delete the selected object
  const deleteSelectedObject = () => {
    if (!canvas || !selectedObj) return;
    
    canvas.remove(selectedObj);
    canvas.renderAll();
    setSelectedObj(null);
    saveToHistory();
  };
  
  // Duplicate the selected object
  const duplicateSelectedObject = () => {
    if (!canvas || !selectedObj) return;
    
    selectedObj.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (selectedObj.left || 0) + 20,
        top: (selectedObj.top || 0) + 20,
        id: `${selectedObj.type}-${Date.now()}`
      });
      
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      setSelectedObj(cloned);
      saveToHistory();
    });
  };
  
  // Copy selected object to clipboard
  const copySelectedObject = () => {
    if (!selectedObj) return;
    
    selectedObj.clone((cloned: fabric.Object) => {
      setClipboard(cloned);
      toast({
        title: "Copied",
        description: "Object copied to clipboard",
      });
    });
  };
  
  // Paste object from clipboard
  const pasteObject = () => {
    if (!canvas || !clipboard) return;
    
    clipboard.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (clipboard.left || 0) + 20,
        top: (clipboard.top || 0) + 20,
        id: `${clipboard.type}-${Date.now()}`
      });
      
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
      setSelectedObj(cloned);
      saveToHistory();
      
      toast({
        title: "Pasted",
        description: "Object pasted from clipboard",
      });
    });
  };
  
  // Undo last action
  const undo = () => {
    if (!canvas || undoStack.length <= 1) return;
    
    const currentState = undoStack.pop();
    if (currentState) {
      setRedoStack(prev => [...prev, currentState]);
      const previousState = undoStack[undoStack.length - 1];
      loadCanvasFromJson(previousState);
      setUndoStack([...undoStack]); // Create a new array to trigger re-render
    }
  };
  
  // Redo last undone action
  const redo = () => {
    if (!canvas || redoStack.length === 0) return;
    
    const nextState = redoStack.pop();
    if (nextState) {
      setUndoStack(prev => [...prev, nextState]);
      loadCanvasFromJson(nextState);
      setRedoStack([...redoStack]); // Create a new array to trigger re-render
    }
  };
  
  // Load canvas from JSON string
  const loadCanvasFromJson = (jsonString: string) => {
    if (!canvas) return;
    
    canvas.loadFromJSON(jsonString, () => {
      canvas.renderAll();
      updateLayers(canvas);
      setSelectedObj(null);
      setCanvasState(jsonString);
    });
  };
  
  // Toggle the tutorial overlay
  const toggleTutorial = () => {
    setShowTutorial(!showTutorial);
  };
  
  // Toggle the layers panel
  const toggleLayers = () => {
    setShowLayersPanel(!showLayersPanel);
    setSelectedTool(showLayersPanel ? null : "layers");
  };
  
  // Toggle the templates panel
  const toggleTemplates = () => {
    setShowTemplates(!showTemplates);
    setSelectedTool(showTemplates ? null : "templates");
  };
  
  // Apply a template to the canvas
  const applyTemplate = (template: DesignTemplate) => {
    if (!canvas) return;
    
    setText(template.name);
    setFont(template.font);
    setFontSize(template.fontSize);
    setColor(template.color);
    setTextEffect(template.effect);
    setStrokeWidth(template.strokeWidth || 0);
    setStrokeColor(template.strokeColor || '#000000');
    
    // Clear the canvas and add the template text
    canvas.clear();
    
    const textObj = new fabric.Text(template.name, {
      id: `text-${Date.now()}`,
      name: `Text: ${template.name}`,
      fill: template.color,
      fontFamily: template.font,
      left: canvas.width / 2,
      top: canvas.height / 2,
      fontSize: template.fontSize,
      originX: 'center',
      originY: 'center',
      stroke: template.strokeWidth > 0 ? template.strokeColor : undefined,
      strokeWidth: template.strokeWidth || 0
    });
    
    if (template.effect !== 'none') {
      applyTextEffect(textObj, template.effect, { 
        strokeColor: template.strokeColor || '#000000',
        color: template.color
      });
    }
    
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    
    setSelectedObj(textObj);
    updateLayers(canvas);
    saveToHistory();
    
    // Close the templates panel
    setShowTemplates(false);
  };
  
  // Export the design as PNG
  const exportDesign = () => {
    if (!canvas) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    
    // Get the canvas data URL
    link.href = canvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    // Set the download filename
    link.download = `${currentDesignName.replace(/\s+/g, '-').toLowerCase()}.png`;
    
    // Append to the document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Save the current design to the server
  const saveDesign = async () => {
    if (!canvas || !canvasState) return;
    
    try {
      const response = await apiRequest('POST', '/api/designs', {
        name: currentDesignName,
        data: canvasState
      });
      
      if (response.ok) {
        const savedDesign = await response.json();
        setSavedDesigns(prev => [...prev, savedDesign]);
        
        // Invalidate the designs query to refetch the list
        queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
        
        return savedDesign;
      } else {
        throw new Error('Failed to save design');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      throw error;
    }
  };
  
  // Load a design from the server
  const loadDesign = async (designId: number) => {
    try {
      const response = await apiRequest('GET', `/api/designs/${designId}`, undefined);
      
      if (response.ok) {
        const design = await response.json();
        loadCanvasFromJson(design.data);
        setCurrentDesignName(design.name);
        return design;
      } else {
        throw new Error('Failed to load design');
      }
    } catch (error) {
      console.error('Error loading design:', error);
      toast({
        title: "Error",
        description: "Failed to load design. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    canvas,
    canvasRef,
    color,
    setColor,
    text,
    setText,
    font,
    setFont,
    fontSize,
    setFontSize,
    selectedObj,
    setSelectedObj,
    opacity,
    setOpacity,
    zoom,
    setZoom,
    view,
    setView,
    theme,
    setTheme,
    strokeColor,
    setStrokeColor,
    strokeWidth,
    setStrokeWidth,
    textEffect,
    setTextEffect,
    showFontPanel,
    setShowFontPanel,
    appliedEffects,
    showTutorial,
    setShowTutorial,
    showToolTips,
    setShowToolTips,
    savedDesigns,
    currentDesignName,
    setCurrentDesignName,
    showLayersPanel,
    setShowLayersPanel,
    layers,
    canvasState,
    showTemplates,
    setShowTemplates,
    selectedTool,
    setSelectedTool,
    addText,
    addShape,
    addImage,
    toggleSettings,
    deleteSelectedObject,
    duplicateSelectedObject,
    undo,
    redo,
    exportDesign,
    saveDesign,
    loadDesign,
    toggleTutorial,
    toggleLayers,
    toggleTemplates,
    applyTemplate,
    designTemplates,
    fontCategories,
    applyTextEffect: (obj: fabric.Object, effect: string) => applyTextEffect(obj, effect, { strokeColor, color }),
    selectObject
  };
}

import { ChangeEvent, useState, useEffect, useCallback } from "react";
import { fabric } from "fabric";
import { ColorPicker } from "@/components/ui/color-picker";
import { textEffects } from "@/lib/textEffects";
import { tintColor } from "@/lib/colorUtils";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import FontPreviewPanel from "@/components/FontPreviewPanel";
import FontCarouselPicker from "@/components/FontCarouselPicker";
import { 
  fetchGoogleFonts, 
  loadFontBatch, 
  isFontLoaded,
  loadLocalFont 
} from "@/lib/fontLoader";
import WebFont from "webfontloader";

interface PropertiesPanelProps {
  selectedObj: fabric.Object | null;
  text: string;
  setText: (text: string) => void;
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  color: string;
  setColor: (color: string) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  textEffect: string;
  setTextEffect: (effect: string) => void;
  showFontPanel: boolean;
  setShowFontPanel: (show: boolean) => void;
  addText: () => void;
  deleteSelectedObject: () => void;
  duplicateSelectedObject: () => void;
  fontCategories: Record<string, string[]>;
  applyTextEffect: (obj: fabric.Object, effect: string) => void;
  canvas: fabric.Canvas | null;
}

export default function PropertiesPanel({
  selectedObj,
  text,
  setText,
  font,
  setFont,
  fontSize,
  setFontSize,
  color,
  setColor,
  opacity,
  setOpacity,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  textEffect,
  setTextEffect,
  showFontPanel,
  setShowFontPanel,
  addText,
  deleteSelectedObject,
  duplicateSelectedObject,
  fontCategories,
  applyTextEffect,
  canvas
}: PropertiesPanelProps) {
  const [selectedFontCategory, setSelectedFontCategory] = useState<string | null>(null);
  const [showFontPreview, setShowFontPreview] = useState(false);
  const [previewText, setPreviewText] = useState(text);
  const [allFonts, setAllFonts] = useState<string[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(true);
  
  // Fetch all fonts when component mounts
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        setIsLoadingFonts(true);
        
        // Fetch all available fonts from Google Fonts API
        const data = await fetchGoogleFonts();
        
        // Get all unique font names from all categories
        const allFontNames = Array.from(new Set(
          data.fonts.map(font => font.family)
        )).sort();
        
        setAllFonts(allFontNames);
        
        // Pre-load the first 20 most popular fonts to ensure they display properly
        const popularFonts = data.fonts.slice(0, 20).map(font => font.family);
        WebFont.load({
          google: {
            families: popularFonts
          }
        });
        
      } catch (error) {
        console.error('Failed to load fonts:', error);
      } finally {
        setIsLoadingFonts(false);
      }
    };
    
    fetchFonts();
  }, []);

  // Update previewText when text changes
  useEffect(() => {
    setPreviewText(text);
  }, [text]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (selectedObj && selectedObj.type === 'text') {
      (selectedObj as fabric.Text).set({ text: e.target.value });
      canvas?.renderAll();
    }
  };

  const handleFontChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    
    // Show loading indicator for the selected font
    const tempElement = document.createElement('div');
    tempElement.style.fontFamily = selectedFont;
    tempElement.style.visibility = 'hidden';
    tempElement.textContent = text || 'Sample Text';
    document.body.appendChild(tempElement);
    
    // Set the font immediately so the UI updates
    setFont(selectedFont);
    
    try {
      // Ensure the font is loaded before applying it
      await loadFontIfNeeded(selectedFont);
      
      if (selectedObj && selectedObj.type === 'text') {
        (selectedObj as fabric.Text).set({ fontFamily: selectedFont });
        canvas?.renderAll();
      }
    } catch (error) {
      console.error('Error loading font:', error);
    } finally {
      // Remove the temporary element
      document.body.removeChild(tempElement);
    }
  };
  
  // Function to load a font if it's not already loaded
  const loadFontIfNeeded = useCallback(async (fontName: string) => {
    // First check if the font is already loaded using our utility function
    if (isFontLoaded(fontName)) {
      return Promise.resolve();
    }
    
    // Check if it's a local font (user uploaded)
    const hasLocalPrefix = fontName.startsWith('Local:');
    if (hasLocalPrefix) {
      // For local fonts, we would handle separately, but this is a placeholder
      try {
        const localFonts = await fetch('/api/fonts/local');
        const localFontsList = await localFonts.json();
        const fontInfo = localFontsList.fonts.find((f: any) => f.family === fontName);
        
        if (fontInfo && fontInfo.url) {
          await loadLocalFont(fontName, fontInfo.url);
          console.log('Loaded local font:', fontName);
          canvas?.renderAll();
          return;
        }
      } catch (error) {
        console.error('Error loading local font:', error);
      }
      
      console.log('Falling back to web fonts for:', fontName);
      return Promise.resolve();
    }
    
    // For Google fonts, use WebFont loader with multiple fallback methods
    return new Promise<void>((resolve, reject) => {
      // First check if the font is already loaded
      if (isFontLoaded(fontName)) {
        console.log(`Font already loaded: ${fontName}`);
        canvas?.renderAll();
        resolve();
        return;
      }
      
      // First try: Use WebFont.load
      WebFont.load({
        google: {
          families: [fontName]
        },
        active: () => {
          console.log(`Font loaded: ${fontName}`);
          canvas?.renderAll();
          resolve();
        },
        inactive: () => {
          console.warn(`Failed to load font: ${fontName}`);
          // Second try: Use direct CSS link as fallback
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}&display=swap`;
          link.rel = 'stylesheet';
          link.onload = () => {
            console.log(`Font loaded via fallback: ${fontName}`);
            canvas?.renderAll();
            resolve();
          };
          link.onerror = () => {
            console.error(`Failed to load font with direct link: ${fontName}`);
            // Third try: Use FontFace API as a final resort
            try {
              const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}&display=swap`;
              fetch(fontUrl)
                .then(response => response.text())
                .then(cssText => {
                  // Try to extract the actual font URL from the CSS
                  const fontUrlMatch = cssText.match(/url\(([^)]+)\)/);
                  if (fontUrlMatch && fontUrlMatch[1]) {
                    const actualFontUrl = fontUrlMatch[1].replace(/"/g, '');
                    const fontFace = new FontFace(fontName, `url(${actualFontUrl})`);
                    fontFace.load()
                      .then(loadedFace => {
                        document.fonts.add(loadedFace);
                        console.log(`Font loaded via FontFace API: ${fontName}`);
                        canvas?.renderAll();
                        resolve();
                      })
                      .catch(err => {
                        console.error(`Failed to load font via FontFace API: ${fontName}`, err);
                        // At this point, we've tried everything we can
                        // Just resolve anyway to prevent blocking the UI
                        resolve();
                      });
                  } else {
                    console.error(`Could not extract font URL from CSS: ${fontName}`);
                    resolve();
                  }
                })
                .catch(err => {
                  console.error(`Failed to fetch font CSS: ${fontName}`, err);
                  resolve();
                });
            } catch (err) {
              console.error(`FontFace API attempt failed: ${fontName}`, err);
              resolve();
            }
          };
          document.head.appendChild(link);
        },
        timeout: 5000 // 5 second timeout
      });
    });
  }, [canvas]);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    if (selectedObj && selectedObj.type === 'text') {
      (selectedObj as fabric.Text).set({ fontSize: value[0] });
      canvas?.renderAll();
    }
  };

  const handleOpacityChange = (value: number[]) => {
    setOpacity(value[0]);
    if (selectedObj) {
      selectedObj.set({ opacity: value[0] / 100 });
      canvas?.renderAll();
    }
  };

  const handleStrokeWidthChange = (value: number[]) => {
    setStrokeWidth(value[0]);
    if (selectedObj) {
      selectedObj.set({ strokeWidth: value[0] });
      canvas?.renderAll();
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    if (selectedObj) {
      selectedObj.set({ fill: newColor });
      canvas?.renderAll();
    }
  };

  const handleStrokeColorChange = (newColor: string) => {
    setStrokeColor(newColor);
    if (selectedObj) {
      selectedObj.set({ stroke: newColor });
      canvas?.renderAll();
    }
  };

  const handleEffectClick = (effect: string) => {
    // Set the effect state
    setTextEffect(effect);
    
    if (selectedObj) {
      if (effect === 'none') {
        // For 'none', remove all effects by resetting properties
        selectedObj.set({
          shadow: null,
          stroke: effect === 'outline' ? strokeColor : undefined,
          strokeWidth: effect === 'outline' ? strokeWidth : 0,
          fill: color
        });
      } else {
        // Apply the selected effect
        applyTextEffect(selectedObj, effect, { strokeColor, color });
      }
      canvas?.renderAll();
    }
  };

  const toggleFontPanel = () => {
    setShowFontPanel(!showFontPanel);
  };
  
  const openFontPreviewGallery = () => {
    setShowFontPreview(true);
  };

  return (
    <div className="w-full md:w-64 lg:w-72 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full overflow-hidden transition-all">
      <div className="border-b border-neutral-200 dark:border-neutral-800 p-3">
        <h3 className="font-medium">Properties</h3>
      </div>
      
      {/* No selection state */}
      {!selectedObj && (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
            <svg className="w-12 h-12 mb-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <p>Select an item on the canvas<br />to edit its properties</p>
            <Button
              className="mt-4"
              onClick={addText}
            >
              Add Text
            </Button>
          </div>
        </div>
      )}
      
      {/* Text selection properties */}
      {selectedObj && selectedObj.type === 'text' && (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Text content */}
            <div>
              <label className="block text-sm font-medium mb-1">Text Content</label>
              <textarea 
                className="w-full p-2 border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-primary focus:border-transparent" 
                rows={2} 
                value={text}
                onChange={handleTextChange}
              />
            </div>
            
            {/* Font family */}
            <div>
              <label className="block text-sm font-medium mb-1">Font</label>
              <div className="relative">
                {isLoadingFonts ? (
                  <div className="w-full p-2 pr-8 border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    <span className="text-sm">Loading fonts...</span>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="mb-2 p-2 rounded-md bg-neutral-50 dark:bg-neutral-800 flex flex-col items-center">
                      <div 
                        className="mb-1 text-center text-base" 
                        style={{ fontFamily: font }}
                      >
                        {text || "Preview Text"}
                      </div>
                      <div className="text-xs text-muted-foreground">{font}</div>
                    </div>
                    <FontCarouselPicker
                      currentFont={font}
                      onFontSelected={async (fontName) => {
                        // Set the font immediately so the UI updates
                        setFont(fontName);
                        
                        try {
                          // Ensure the font is loaded before applying it
                          await loadFontIfNeeded(fontName);
                          
                          // Apply the font to the selected object
                          if (selectedObj && selectedObj.type === 'text') {
                            (selectedObj as fabric.Text).set({ fontFamily: fontName });
                            canvas?.renderAll();
                          }
                        } catch (error) {
                          console.error('Error loading font:', error);
                        }
                      }}
                      sampleText={text || "The quick brown fox"}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-1">
                <button 
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center"
                  onClick={openFontPreviewGallery}
                >
                  <span>Browse All Fonts</span>
                  <svg className="w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Font size */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">Size</label>
                <span className="text-xs">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                min={8}
                max={120}
                step={1}
                onValueChange={handleFontSizeChange}
              />
            </div>
            
            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <ColorPicker color={color} onChange={handleColorChange} />
            </div>

            {/* Text effects */}
            <div>
              <label className="block text-sm font-medium mb-1">Text Effects</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(textEffects).map(([key, { name, icon }]) => (
                  <button
                    key={key}
                    className={`py-2 px-1 flex flex-col items-center text-xs rounded border ${
                      textEffect === key
                        ? 'border-primary bg-primary/10'
                        : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    } transition-colors`}
                    onClick={() => handleEffectClick(key)}
                  >
                    <span className="text-lg mb-1">{icon}</span>
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke settings (shown when outline effect is active or stroke width > 0) */}
            {(textEffect === 'outline' || strokeWidth > 0) && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium">Outline Width</label>
                  <span className="text-xs">{strokeWidth}px</span>
                </div>
                <Slider
                  value={[strokeWidth]}
                  min={0}
                  max={10}
                  step={0.5}
                  onValueChange={handleStrokeWidthChange}
                />
                
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Outline Color</label>
                  <ColorPicker 
                    color={strokeColor} 
                    onChange={handleStrokeColorChange} 
                    colorPalette={[
                      "#000000", "#FFFFFF", "#e74c3c", "#3498db", "#2ecc71",
                      "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22", "#7f8c8d",
                    ]}
                  />
                </div>
              </div>
            )}
            
            {/* Opacity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">Opacity</label>
                <span className="text-xs">{opacity}%</span>
              </div>
              <Slider
                value={[opacity]}
                min={1}
                max={100}
                step={1}
                onValueChange={handleOpacityChange}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Buttons for selected object */}
      {selectedObj && (
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex space-x-2">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={deleteSelectedObject}
          >
            Delete
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={duplicateSelectedObject}
          >
            Duplicate
          </Button>
        </div>
      )}

      {/* Font Preview Gallery */}
      <FontPreviewPanel
        showFontPreview={showFontPreview}
        setShowFontPreview={setShowFontPreview}
        previewText={previewText}
        setPreviewText={setPreviewText}
        currentFont={font}
        setFont={setFont}
        fontCategories={fontCategories}
      />
    </div>
  );
}

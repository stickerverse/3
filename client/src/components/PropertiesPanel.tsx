import { ChangeEvent, useState } from "react";
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

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (selectedObj && selectedObj.type === 'text') {
      (selectedObj as fabric.Text).set({ text: e.target.value });
      canvas?.renderAll();
    }
  };

  const handleFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFont(e.target.value);
    if (selectedObj && selectedObj.type === 'text') {
      (selectedObj as fabric.Text).set({ fontFamily: e.target.value });
      canvas?.renderAll();
    }
  };

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
    setTextEffect(effect);
    if (selectedObj) {
      applyTextEffect(selectedObj, effect);
      canvas?.renderAll();
    }
  };

  const toggleFontPanel = () => {
    setShowFontPanel(!showFontPanel);
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
                <select 
                  className="w-full p-2 pr-8 border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 appearance-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                  value={font}
                  onChange={handleFontChange}
                >
                  <option style={{ fontFamily: 'Anton' }} value="Anton">Anton</option>
                  <option style={{ fontFamily: 'Bebas Neue' }} value="Bebas Neue">Bebas Neue</option>
                  <option style={{ fontFamily: 'Montserrat' }} value="Montserrat">Montserrat</option>
                  <option style={{ fontFamily: 'Pacifico' }} value="Pacifico">Pacifico</option>
                  <option style={{ fontFamily: 'Permanent Marker' }} value="Permanent Marker">Permanent Marker</option>
                  <option style={{ fontFamily: 'Oswald' }} value="Oswald">Oswald</option>
                  <option style={{ fontFamily: 'Roboto' }} value="Roboto">Roboto</option>
                  <option style={{ fontFamily: 'Lato' }} value="Lato">Lato</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-5 h-5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <button 
                className="mt-1 text-xs text-primary hover:text-primary/80 transition-colors flex items-center" 
                onClick={toggleFontPanel}
              >
                <span>{showFontPanel ? "Hide font categories" : "Show more fonts"}</span>
                <svg className={`w-3 h-3 ml-1 transition-transform ${showFontPanel ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {showFontPanel && (
                <div className="mt-2 border border-neutral-100 dark:border-neutral-800 rounded p-2 bg-neutral-50 dark:bg-neutral-800">
                  <Accordion type="single" collapsible>
                    {Object.entries(fontCategories).map(([category, fonts]) => (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger className="text-sm py-1">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                            {fonts.map((fontName) => (
                              <button
                                key={fontName}
                                className={`text-sm text-left p-1 rounded ${font === fontName ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                                style={{ fontFamily: fontName }}
                                onClick={() => {
                                  setFont(fontName);
                                  if (selectedObj && selectedObj.type === 'text') {
                                    (selectedObj as fabric.Text).set({ fontFamily: fontName });
                                    canvas?.renderAll();
                                  }
                                }}
                              >
                                {fontName}
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
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
    </div>
  );
}

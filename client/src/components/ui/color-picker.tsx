import { useEffect, useRef, useState } from "react";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  colorPalette?: string[];
}

export function ColorPicker({ 
  color, 
  onChange, 
  colorPalette = [
    "#e74c3c", "#e84393", "#ff6b6b", "#ff9ff3", "#fd79a8", 
    "#9b59b6", "#6c5ce7", "#8c7ae6", "#3498db", "#0abde3", 
    "#4e9ff5", "#55c8f9", "#0CD7E4", "#81ECEC", "#00D572", 
    "#ADFF2F", "#FFFF00", "#F1C40F", "#FDA22A", "#FF8833",
    "#F97432", "#000000", "#7F8C8D", "#FFFFFF", "#2d3436"
  ]
}: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(color);
  
  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  const handleColorChange = (color: any) => {
    setSelectedColor(color.hex);
    onChange(color.hex);
  };

  const handlePaletteColorClick = (paletteColor: string) => {
    setSelectedColor(paletteColor);
    onChange(paletteColor);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {colorPalette.slice(0, 10).map((paletteColor, index) => (
          <button
            key={index}
            className={`w-6 h-6 rounded-full border ${
              selectedColor === paletteColor 
                ? "border-primary ring-2 ring-primary/50" 
                : "border-neutral-300 dark:border-neutral-600"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light`}
            style={{ backgroundColor: paletteColor }}
            onClick={() => handlePaletteColorClick(paletteColor)}
          />
        ))}
        
        <Popover open={showPicker} onOpenChange={setShowPicker}>
          <PopoverTrigger asChild>
            <button 
              className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center bg-white dark:bg-neutral-800"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67A2.5 2.5 0 0112 22zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 00-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 012.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7z" />
                <circle cx="6.5" cy="11.5" r="1.5" />
                <circle cx="9.5" cy="7.5" r="1.5" />
                <circle cx="14.5" cy="7.5" r="1.5" />
                <circle cx="17.5" cy="11.5" r="1.5" />
              </svg>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-lg">
            <SketchPicker
              color={selectedColor}
              onChange={handleColorChange}
              disableAlpha={true}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

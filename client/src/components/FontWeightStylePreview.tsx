import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Type } from "lucide-react";
import googleFontsService from "@/lib/googleFontsService";

interface FontWeightStylePreviewProps {
  fontFamily: string;
  sampleText?: string;
  onWeightChange?: (weight: number) => void;
  onStyleChange?: (isItalic: boolean) => void;
  onUnderlineChange?: (isUnderlined: boolean) => void;
}

// Mapping common weight names to numeric values
const weightMap: Record<string, number> = {
  'Thin': 100,
  'Extra Light': 200,
  'Light': 300,
  'Regular': 400,
  'Normal': 400,
  'Medium': 500,
  'Semi Bold': 600,
  'Bold': 700,
  'Extra Bold': 800,
  'Black': 900
};

// Mapping numeric values to weight names
const reverseWeightMap: Record<number, string> = {
  100: 'Thin',
  200: 'Extra Light',
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  600: 'Semi Bold',
  700: 'Bold',
  800: 'Extra Bold',
  900: 'Black'
};

export default function FontWeightStylePreview({
  fontFamily,
  sampleText = "The quick brown fox jumps over the lazy dog",
  onWeightChange,
  onStyleChange,
  onUnderlineChange
}: FontWeightStylePreviewProps) {
  const [weight, setWeight] = useState<number>(400);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUnderlined, setIsUnderlined] = useState<boolean>(false);
  const [availableWeights, setAvailableWeights] = useState<number[]>([400, 700]);
  const [previewSize, setPreviewSize] = useState<number>(24);
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);

  // Load available font weights for this font family
  useEffect(() => {
    async function loadFontDetails() {
      try {
        // Reset to default state when font changes
        setWeight(400); 
        setIsItalic(false);
        setIsUnderlined(false);
        setFontLoaded(false);

        // Try to get font variants from service (if available)
        const fontData = await googleFontsService.getFontInfo(fontFamily);
        
        if (fontData && fontData.variants) {
          // Parse variants to get available weights
          const weights = new Set<number>();
          
          fontData.variants.forEach((variant: string) => {
            // Regular/normal variants
            if (variant === 'regular') {
              weights.add(400);
            } 
            // Italic variants (without weight)
            else if (variant === 'italic') {
              weights.add(400);
            }
            // Regular weights (100, 200, etc.)
            else if (/^\d+$/.test(variant)) {
              weights.add(parseInt(variant, 10));
            }
            // Weight with italic (e.g., "700italic")
            else if (/^(\d+)italic$/.test(variant)) {
              const match = variant.match(/^(\d+)italic$/);
              if (match && match[1]) {
                weights.add(parseInt(match[1], 10));
              }
            }
          });
          
          // Convert to array and sort
          const sortedWeights = Array.from(weights).sort((a, b) => a - b);
          
          if (sortedWeights.length > 0) {
            setAvailableWeights(sortedWeights);
            
            // Set default weight to 400 if available, otherwise use the first available
            if (sortedWeights.includes(400)) {
              setWeight(400);
            } else {
              setWeight(sortedWeights[0]);
            }
          }
        } else {
          // If we can't get specific weights, use common ones
          setAvailableWeights([400, 700]);
        }

        // Load the font with both regular and italic styles
        await googleFontsService.loadFonts(fontFamily);

        // Mark as loaded
        setFontLoaded(true);
      } catch (error) {
        console.error("Error loading font details:", error);
        // Fallback to default weights
        setAvailableWeights([400, 700]);
      }
    }

    if (fontFamily) {
      loadFontDetails();
    }
  }, [fontFamily]);

  // Handler for weight change
  const handleWeightChange = (newWeight: number[]) => {
    // Find the closest available weight
    const targetWeight = newWeight[0];
    const closestWeight = availableWeights.reduce((prev, curr) => {
      return (Math.abs(curr - targetWeight) < Math.abs(prev - targetWeight)) ? curr : prev;
    });
    
    setWeight(closestWeight);
    
    if (onWeightChange) {
      onWeightChange(closestWeight);
    }
  };

  // Handler for italic toggle
  const handleItalicToggle = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    
    if (onStyleChange) {
      onStyleChange(newItalic);
    }
  };

  // Handler for underline toggle
  const handleUnderlineToggle = () => {
    const newUnderlined = !isUnderlined;
    setIsUnderlined(newUnderlined);
    
    if (onUnderlineChange) {
      onUnderlineChange(newUnderlined);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Font preview with current settings */}
      <div className="mb-4 border rounded-md p-4 overflow-hidden">
        <div className="mb-2 flex justify-between">
          <span className="text-sm text-muted-foreground">
            Preview: {fontFamily} {reverseWeightMap[weight] || weight} 
            {isItalic ? ' Italic' : ''}
          </span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6"
              onClick={() => setPreviewSize(Math.max(12, previewSize - 4))}
            >
              <Type className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6"
              onClick={() => setPreviewSize(Math.min(48, previewSize + 4))}
            >
              <Type className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
        <div 
          className="font-preview min-h-[100px] flex items-center justify-center"
          style={{ 
            fontFamily: fontLoaded ? fontFamily : 'sans-serif',
            fontWeight: weight, 
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderlined ? 'underline' : 'none',
            fontSize: `${previewSize}px`,
            lineHeight: '1.3'
          }}
        >
          {sampleText}
        </div>
      </div>

      {/* Font weight slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="font-weight" className="text-sm font-medium">
            Font Weight: {reverseWeightMap[weight] || weight}
          </Label>
        </div>
        <Slider
          id="font-weight"
          min={100}
          max={900}
          step={100}
          value={[weight]}
          onValueChange={handleWeightChange}
          disabled={availableWeights.length <= 1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Thin</span>
          <span>Regular</span>
          <span>Bold</span>
        </div>
      </div>

      {/* Font style toggles */}
      <div className="flex items-center space-x-8 pt-2">
        <div className="flex items-center space-x-2">
          <Button
            variant={isItalic ? "default" : "outline"}
            size="icon"
            onClick={handleItalicToggle}
            className="h-8 w-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Label htmlFor="italic-toggle" className="text-sm">
            Italic
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={isUnderlined ? "default" : "outline"}
            size="icon"
            onClick={handleUnderlineToggle}
            className="h-8 w-8"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Label htmlFor="underline-toggle" className="text-sm">
            Underline
          </Label>
        </div>
      </div>

      {/* Available weights display */}
      {availableWeights.length > 0 && (
        <div className="pt-2">
          <Label className="text-sm font-medium mb-1 block">Available Weights</Label>
          <div className="flex flex-wrap gap-1">
            {availableWeights.map(w => (
              <Button
                key={w}
                size="sm"
                variant={weight === w ? "default" : "outline"}
                className="text-xs"
                onClick={() => handleWeightChange([w])}
              >
                {reverseWeightMap[w] || w}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
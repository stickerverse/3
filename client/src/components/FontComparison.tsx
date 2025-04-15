import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import googleFontsService from '@/lib/googleFontsService';
import { X, Plus, Trash, Maximize2, Minimize2, Copy } from 'lucide-react';

interface FontComparisonProps {
  currentFont?: string;
  onFontSelected?: (font: string) => void;
}

export default function FontComparison({ 
  currentFont = '',
  onFontSelected 
}: FontComparisonProps) {
  // State for managing displayed fonts
  const [comparisonFonts, setComparisonFonts] = useState<string[]>([]);
  const [sampleText, setSampleText] = useState<string>("The quick brown fox jumps over the lazy dog");
  const [availableFonts, setAvailableFonts] = useState<string[]>([]);
  const [fontSize, setFontSize] = useState<number>(32);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [fontCase, setFontCase] = useState<'normal' | 'uppercase' | 'lowercase'>('normal');
  const [showAllCharacters, setShowAllCharacters] = useState<boolean>(false);
  const [showLineHeight, setShowLineHeight] = useState<boolean>(false);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allCharacters, setAllCharacters] = useState<string>(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};':\",./<>?\\|`~"
  );

  // Presets for sample text
  const textPresets = [
    { name: "Pangram", text: "The quick brown fox jumps over the lazy dog" },
    { name: "Alphabet", text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz" },
    { name: "Numbers", text: "0123456789" },
    { name: "Symbols", text: "!@#$%^&*()_+-=[]{}\\|;':\",./<>?`~" },
    { name: "Paragraph", text: "This is a longer paragraph that demonstrates how this font looks in a body of text. It shows line spacing and overall text flow when used in content blocks. Good typography enhances readability and user experience." }
  ];

  // Load available fonts when component mounts
  useEffect(() => {
    async function loadFonts() {
      try {
        // Load fonts from all categories
        setIsLoading(true);
        
        // First, get system fonts (local fonts)
        await googleFontsService.ensureSystemFontsLoaded();
        const systemFonts = googleFontsService.getSystemFonts() || [];
        
        // Then get Google Fonts
        const data = await googleFontsService.fetchGoogleFonts("all");
        const googleFontsList = data.fonts ? data.fonts.map((font: any) => font.family) : [];
        
        // Combine all available fonts, filtering out duplicates
        const combinedFonts = [...systemFonts, ...googleFontsList];
        const allFonts = combinedFonts.filter((font, index) => combinedFonts.indexOf(font) === index);
        
        console.log(`Font comparison tool loaded ${allFonts.length} fonts (${systemFonts.length} system, ${googleFontsList.length} Google)`);
        setAvailableFonts(allFonts);
        
        // Initialize with current font if provided and not already in comparison list
        if (currentFont && !comparisonFonts.includes(currentFont)) {
          setComparisonFonts(prev => [...prev, currentFont]);
        } else if (comparisonFonts.length === 0 && allFonts.length > 0) {
          // Default to first font if none selected
          setComparisonFonts([allFonts[0]]);
        }
        
        // Preload the fonts that are in the comparison
        if (comparisonFonts.length > 0) {
          await googleFontsService.loadFonts(comparisonFonts);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading fonts for comparison:', error);
        setIsLoading(false);
      }
    }
    
    loadFonts();
  }, [currentFont]);
  
  // Preload the currentFont whenever it changes
  useEffect(() => {
    if (currentFont) {
      googleFontsService.loadFonts([currentFont]).catch(err => {
        console.warn(`Failed to preload current font ${currentFont}:`, err);
      });
    }
  }, [currentFont]);

  // Add a font to comparison
  const addFont = (font: string) => {
    if (!comparisonFonts.includes(font)) {
      setComparisonFonts(prev => [...prev, font]);
    }
  };

  // Remove a font from comparison
  const removeFont = (indexToRemove: number) => {
    setComparisonFonts(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Select a font from the comparison
  const selectFont = async (font: string) => {
    if (onFontSelected) {
      // Make sure the font is loaded before notifying parent
      try {
        await googleFontsService.loadFonts([font]);
        console.log(`Preloaded font ${font} before selection`);
      } catch (err) {
        console.warn(`Failed to preload font ${font} before selection:`, err);
      }
      
      onFontSelected(font);
      setIsDialogOpen(false);
    }
  };

  // Apply text case transformation
  const getDisplayText = (text: string) => {
    switch (fontCase) {
      case 'uppercase': return text.toUpperCase();
      case 'lowercase': return text.toLowerCase();
      default: return text;
    }
  };

  // Copy text to clipboard
  const copyTextAsStyled = (fontFamily: string) => {
    const textToCopy = `Sample text in ${fontFamily} font`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        // Show a temporary success message (you could use a toast here)
        console.log('Text copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Determine what text to display based on settings
  const getTextToDisplay = () => {
    return showAllCharacters ? allCharacters : sampleText;
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsDialogOpen(true)}
        className="w-full"
      >
        Font Comparison Tool
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className={isFullScreen ? "max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh]" : "max-w-4xl"} 
          aria-describedby="Font comparison tool dialog"
        >
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Font Comparison Tool</DialogTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsFullScreen(!isFullScreen)}
                >
                  {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogDescription>
              Compare different fonts side by side to find the perfect match for your design.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Controls section */}
            <div className="bg-muted/40 p-3 rounded-md space-y-3">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Select 
                    onValueChange={(value) => setSampleText(value)}
                    defaultValue={textPresets[0].text}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Text presets" />
                    </SelectTrigger>
                    <SelectContent>
                      {textPresets.map((preset, index) => (
                        <SelectItem key={index} value={preset.text}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 items-center">
                  <Label htmlFor="fontSize" className="text-xs whitespace-nowrap">Size: {fontSize}px</Label>
                  <Slider
                    id="fontSize"
                    min={8}
                    max={120}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(values) => setFontSize(values[0])}
                    className="w-24"
                  />
                </div>

                <Select 
                  onValueChange={(value) => setFontCase(value as 'normal' | 'uppercase' | 'lowercase')}
                  defaultValue="normal"
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-characters"
                    checked={showAllCharacters}
                    onCheckedChange={setShowAllCharacters}
                  />
                  <Label htmlFor="show-characters" className="text-xs">Show All Characters</Label>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Type custom text..."
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    disabled={showAllCharacters}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="line-height"
                    checked={showLineHeight}
                    onCheckedChange={setShowLineHeight}
                  />
                  <Label htmlFor="line-height" className="text-xs">Line Height: {lineHeight}</Label>
                  {showLineHeight && (
                    <Slider
                      min={0.8}
                      max={3}
                      step={0.1}
                      value={[lineHeight]}
                      onValueChange={(values) => setLineHeight(values[0])}
                      className="w-24"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Add font section */}
            <div className="flex gap-2">
              <Select 
                onValueChange={(font) => addFont(font)}
                disabled={isLoading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={isLoading ? "Loading fonts..." : "Add font to comparison"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableFonts.map((font, index) => (
                    <SelectItem key={index} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font comparison section */}
            <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-60 text-center">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p className="text-muted-foreground">Loading fonts...</p>
                </div>
              ) : comparisonFonts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed rounded-md">
                  <p>Add fonts to start comparing</p>
                </div>
              ) : (
                comparisonFonts.map((font, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md p-3 hover:shadow-md transition-shadow relative"
                  >
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyTextAsStyled(font)}
                        className="h-6 w-6"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeFont(index)}
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm truncate max-w-[80%]" title={font}>
                          {font}
                        </h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => selectFont(font)}
                          className="text-xs h-6 px-2"
                        >
                          Select
                        </Button>
                      </div>
                      
                      <div 
                        className="font-preview p-2 bg-white dark:bg-gray-900 rounded-md border"
                        style={{ 
                          fontFamily: font,
                          fontSize: `${fontSize}px`,
                          lineHeight: showLineHeight ? lineHeight : 'normal'
                        }}
                      >
                        {getDisplayText(getTextToDisplay())}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Comparing {comparisonFonts.length} {comparisonFonts.length === 1 ? 'font' : 'fonts'}
            </div>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
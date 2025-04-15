import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { fontCategories as googleFontCategories, loadFontsByCategory } from "@/lib/fontLoader";
import WebFont from "webfontloader";

interface FontPreviewPanelProps {
  showFontPreview: boolean;
  setShowFontPreview: (show: boolean) => void;
  previewText: string;
  setPreviewText: (text: string) => void;
  currentFont: string;
  setFont: (font: string) => void;
  fontCategories: Record<string, string[]>;
}

export default function FontPreviewPanel({
  showFontPreview,
  setShowFontPreview,
  previewText,
  setPreviewText,
  currentFont,
  setFont,
  fontCategories
}: FontPreviewPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());

  // Use Google Fonts categories if available
  const allCategories = Object.keys(googleFontCategories).length > 0 ? googleFontCategories : fontCategories;
  
  // Get all fonts from all categories
  const allFonts = Object.values(allCategories).flat();

  // Filter fonts based on search and category
  useEffect(() => {
    let fonts: string[] = [];
    
    if (selectedCategory === "all") {
      fonts = allFonts;
    } else {
      fonts = allCategories[selectedCategory] || [];
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fonts = fonts.filter(font => font.toLowerCase().includes(query));
    }
    
    setFilteredFonts(fonts);
  }, [searchQuery, selectedCategory, allCategories, allFonts]);

  // Load fonts for the selected category when tab changes
  useEffect(() => {
    const loadFontsForCategory = async () => {
      if (selectedCategory === "all" || loadedCategories.has(selectedCategory)) {
        return;
      }
      
      setIsLoadingFonts(true);
      
      try {
        await loadFontsByCategory(selectedCategory);
        setLoadedCategories(prev => new Set([...prev, selectedCategory]));
      } catch (error) {
        console.error(`Error loading fonts for category ${selectedCategory}:`, error);
      } finally {
        setIsLoadingFonts(false);
      }
    };
    
    loadFontsForCategory();
  }, [selectedCategory, loadedCategories]);

  // Load a specific font on demand when it's clicked but not yet loaded
  const ensureFontLoaded = (fontFamily: string) => {
    return new Promise<void>((resolve, reject) => {
      const isFontLoaded = document.fonts.check(`12px "${fontFamily}"`);
      
      if (isFontLoaded) {
        resolve();
        return;
      }
      
      WebFont.load({
        google: {
          families: [fontFamily]
        },
        active: () => resolve(),
        inactive: () => reject(new Error(`Failed to load font: ${fontFamily}`)),
        timeout: 3000 // 3 second timeout
      });
    });
  };

  // Handle font selection with loading if needed
  const handleSelectFont = async (font: string) => {
    try {
      await ensureFontLoaded(font);
      setFont(font);
    } catch (error) {
      console.error("Error loading font:", error);
      // Load the font anyway as it might still work
      setFont(font);
    }
  };

  return (
    <Dialog open={showFontPreview} onOpenChange={setShowFontPreview}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Font Preview Gallery</DialogTitle>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Browse from over 100 Google Fonts to find the perfect style for your design
          </p>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Input
              placeholder="Enter preview text..."
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <TabsList className="flex flex-wrap justify-start mb-2">
            <TabsTrigger value="all">All Fonts</TabsTrigger>
            {Object.keys(allCategories).map(category => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="flex-1 border rounded-md p-4">
            {isLoadingFonts ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading fonts...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFonts.map(font => (
                  <div 
                    key={font}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      currentFont === font ? 'border-primary border-2' : 'border-neutral-200 dark:border-neutral-700'
                    }`}
                    onClick={() => handleSelectFont(font)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                        {font}
                      </span>
                      {currentFont === font && (
                        <Badge variant="default" className="ml-2">Selected</Badge>
                      )}
                    </div>
                    <div 
                      className="h-14 flex items-center justify-center overflow-hidden"
                      style={{ fontFamily: `'${font}', sans-serif` }}
                    >
                      <span className="text-2xl truncate">
                        {previewText || "Your Text Here"}
                      </span>
                    </div>
                  </div>
                ))}
                
                {filteredFonts.length === 0 && (
                  <div className="col-span-full text-center p-8 text-neutral-500">
                    No fonts match your search criteria
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="text-xs text-neutral-500">
            Fonts provided by Google Fonts
          </div>
          <Button variant="outline" onClick={() => setShowFontPreview(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
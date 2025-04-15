import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { 
  fontCategories as defaultFontCategories, 
  loadFontsByCategory,
  fetchGoogleFonts,
  isFontLoaded 
} from "@/lib/fontLoader";
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
  fontCategories: propFontCategories
}: FontPreviewPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [loadedCategories, setLoadedCategories] = useState<Set<string>>(new Set());
  const [apiCategories, setApiCategories] = useState<Record<string, string[]> | null>(null);
  const [popularFonts, setPopularFonts] = useState<Array<{family: string, category: string}>>([]);

  // Use Google Fonts categories from API if available, otherwise use default categories
  const allCategories = apiCategories || defaultFontCategories;
  
  // Initial load of categories from Google Fonts API
  useEffect(() => {
    const loadGoogleFonts = async () => {
      if (!showFontPreview) return;
      
      setIsLoadingCategories(true);
      
      try {
        // Fetch categories from Google Fonts API
        const data = await fetchGoogleFonts();
        setApiCategories(data.categories);
        
        // Set popular fonts for recommendations
        setPopularFonts(data.fonts.slice(0, 30).map(font => ({
          family: font.family,
          category: font.category
        })));
        
        // Pre-load the most popular fonts
        const popularFontFamilies = data.fonts.slice(0, 12).map(font => font.family);
        WebFont.load({
          google: {
            families: popularFontFamilies
          }
        });
        
      } catch (error) {
        console.error('Failed to load Google Fonts:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    loadGoogleFonts();
  }, [showFontPreview]);
  
  // Get all fonts from all categories
  const allFonts = Object.values(allCategories).flat();

  // Filter fonts based on search and category
  useEffect(() => {
    if (isLoadingCategories) return;
    
    let fonts: string[] = [];
    
    if (selectedCategory === "all") {
      if (searchQuery) {
        // If searching, include all fonts
        fonts = allFonts;
      } else {
        // If not searching, just show popular fonts to avoid overwhelming the UI
        fonts = popularFonts.map(font => font.family);
      }
    } else {
      // Get fonts for the selected category
      fonts = allCategories[selectedCategory] || [];
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fonts = fonts.filter(font => font.toLowerCase().includes(query));
    }
    
    setFilteredFonts(fonts);
  }, [searchQuery, selectedCategory, allCategories, allFonts, popularFonts, isLoadingCategories]);

  // Load fonts for the selected category when tab changes
  useEffect(() => {
    const loadFontsForCategory = async () => {
      if (selectedCategory === "all" || loadedCategories.has(selectedCategory)) {
        return;
      }
      
      setIsLoadingFonts(true);
      
      try {
        await loadFontsByCategory(selectedCategory);
        setLoadedCategories(prev => new Set([...Array.from(prev), selectedCategory]));
      } catch (error) {
        console.error(`Error loading fonts for category ${selectedCategory}:`, error);
      } finally {
        setIsLoadingFonts(false);
      }
    };
    
    if (!isLoadingCategories) {
      loadFontsForCategory();
    }
  }, [selectedCategory, loadedCategories, isLoadingCategories]);

  // Load a specific font on demand when it's clicked but not yet loaded
  const ensureFontLoaded = (fontFamily: string) => {
    return new Promise<void>((resolve, reject) => {
      if (isFontLoaded(fontFamily)) {
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

  // Gets the category for a font
  const getFontCategory = (fontFamily: string): string => {
    if (!apiCategories) return "unknown";
    
    for (const [category, fonts] of Object.entries(apiCategories)) {
      if (fonts.includes(fontFamily)) {
        return category;
      }
    }
    
    return "unknown";
  };

  return (
    <Dialog open={showFontPreview} onOpenChange={setShowFontPreview}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Font Preview Gallery</DialogTitle>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Browse from over 1,000 Google Fonts to find the perfect style for your design
          </p>
        </DialogHeader>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
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
        
        {isLoadingCategories ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading Google Fonts...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            <TabsList className="flex flex-wrap justify-start mb-2">
              <TabsTrigger value="all">Popular Fonts</TabsTrigger>
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
                        currentFont === font ? 'border-primary border-2 bg-primary/5' : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                      onClick={() => handleSelectFont(font)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium truncate">
                            {font}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {getFontCategory(font)}
                          </span>
                        </div>
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
        )}
        
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="text-xs text-neutral-500">
            Fonts provided by Google Fonts API
          </div>
          <Button variant="outline" onClick={() => setShowFontPreview(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
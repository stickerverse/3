import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchGoogleFonts, loadFontBatch, isFontLoaded } from "@/lib/fontLoader";
import WebFont from "webfontloader";

interface FontSelectorProps {
  onFontSelected: (font: string) => void;
  initialFont?: string;
  buttonText?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  showPreviewSizes?: boolean;
}

interface FontCategory {
  name: string;
  fonts: string[];
}

export default function FontSelector({
  onFontSelected,
  initialFont = "Roboto",
  buttonText = "Select Font",
  buttonVariant = "outline",
  buttonSize = "default",
  showPreviewSizes = true
}: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [sampleText, setSampleText] = useState("The quick brown fox jumps over the lazy dog");
  const [categories, setCategories] = useState<FontCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Fonts");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>(initialFont);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewSize, setPreviewSize] = useState(24);
  const [loading, setLoading] = useState(true);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [popularFonts, setPopularFonts] = useState<string[]>([]);
  const { toast } = useToast();

  // Load fonts when component mounts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        setLoading(true);
        // Fetch fonts from Google API
        const response = await fetchGoogleFonts();
        const fonts = response.fonts;
        
        // Extract all unique categories
        const categoriesMap = new Map<string, string[]>();
        categoriesMap.set("All Fonts", fonts.map(font => font.family));
        
        fonts.forEach(font => {
          const category = font.category.charAt(0).toUpperCase() + font.category.slice(1);
          if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
          }
          categoriesMap.get(category)?.push(font.family);
        });
        
        // Convert map to array for component state
        const categoriesArray: FontCategory[] = Array.from(categoriesMap).map(([name, fonts]) => ({
          name,
          fonts
        }));
        
        // Set initial filtered fonts to 'All Fonts'
        setCategories(categoriesArray);
        setFilteredFonts(categoriesArray[0].fonts);
        
        // Get popular fonts (first 15)
        const popular = fonts.slice(0, 15).map(font => font.family);
        setPopularFonts(popular);
        
        // Load popular fonts
        WebFont.load({
          google: {
            families: popular
          },
          active: () => {
            console.log("Popular fonts loaded successfully");
          },
          inactive: () => {
            console.warn("Some popular fonts failed to load");
          }
        });
        
      } catch (error) {
        console.error("Failed to load fonts:", error);
        toast({
          title: "Error loading fonts",
          description: "Could not load font list. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadFonts();
  }, []);

  // Filter fonts when category or search term changes
  useEffect(() => {
    if (categories.length === 0) return;
    
    const category = categories.find(c => c.name === selectedCategory);
    if (!category) return;
    
    let fonts = category.fonts;
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      fonts = fonts.filter(font => 
        font.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredFonts(fonts);
  }, [selectedCategory, searchTerm, categories]);

  // Load font batch when user scrolls into a new set of fonts
  const loadVisibleFonts = useCallback(async (visibleFonts: string[]) => {
    try {
      setLoadingBatch(true);
      await loadFontBatch(visibleFonts);
    } catch (error) {
      console.error("Error loading font batch:", error);
    } finally {
      setLoadingBatch(false);
    }
  }, []);

  // Handler for intersection observer (fonts coming into view)
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    const visibleFonts: string[] = [];
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fontName = entry.target.getAttribute('data-font');
        if (fontName && !isFontLoaded(fontName)) {
          visibleFonts.push(fontName);
        }
      }
    });
    
    if (visibleFonts.length > 0) {
      loadVisibleFonts(visibleFonts);
    }
  }, [loadVisibleFonts]);

  // Setup intersection observer for lazy loading fonts
  useEffect(() => {
    if (loading) return;
    
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(handleIntersection, options);
    
    const fontElements = document.querySelectorAll('.font-preview-item');
    fontElements.forEach(el => observer.observe(el));
    
    return () => {
      fontElements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [loading, filteredFonts, handleIntersection]);

  const handleFontSelected = (font: string) => {
    setSelectedFont(font);
    
    // Ensure the font is loaded before calling the callback
    if (!isFontLoaded(font)) {
      WebFont.load({
        google: {
          families: [font]
        },
        active: () => {
          onFontSelected(font);
          setOpen(false);
        },
        inactive: () => {
          console.warn(`Failed to load font: ${font}`);
          onFontSelected(font); // Still select it, but it might not display properly
          setOpen(false);
        },
        timeout: 2000 // 2 second timeout
      });
    } else {
      onFontSelected(font);
      setOpen(false);
    }
  };

  const previewSizes = [16, 24, 32, 48];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize} 
          className="font-selector-trigger"
          style={{ fontFamily: selectedFont }}
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Font Selector</DialogTitle>
          <DialogDescription>
            Browse and preview fonts to use in your design.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 py-4">
          {/* Search and preview text controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="font-search">Search Fonts</Label>
              <Input
                id="font-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sample-text">Sample Text</Label>
              <Input
                id="sample-text"
                placeholder="Enter text to preview"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
              />
            </div>
          </div>

          {/* Font size slider (conditionally shown) */}
          {showPreviewSizes && (
            <div>
              <div className="flex justify-between mb-1">
                <Label htmlFor="preview-size">Preview Size: {previewSize}px</Label>
                <div className="flex space-x-2">
                  {previewSizes.map(size => (
                    <Button 
                      key={size} 
                      variant={previewSize === size ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setPreviewSize(size)}
                      className="h-7 px-2 text-xs"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
              <Slider
                id="preview-size"
                value={[previewSize]}
                min={12}
                max={72}
                step={1}
                onValueChange={(value) => setPreviewSize(value[0])}
              />
            </div>
          )}

          {/* Tabs for browsing fonts by different methods */}
          <Tabs defaultValue="categories">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="all">All Fonts</TabsTrigger>
            </TabsList>
            
            {/* Categories tab */}
            <TabsContent value="categories" className="space-y-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredFonts.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    No fonts found matching your search.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFonts.map((font) => (
                      <div
                        key={font}
                        className="font-preview-item p-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                        data-font={font}
                        onClick={() => handleFontSelected(font)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium">{font}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFontSelected(font);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                        <p 
                          style={{ 
                            fontFamily: `"${font}", sans-serif`, 
                            fontSize: `${previewSize}px`,
                            lineHeight: 1.2
                          }}
                          className="mt-1 break-words"
                        >
                          {sampleText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            {/* Popular fonts tab */}
            <TabsContent value="popular">
              <ScrollArea className="h-[450px] rounded-md border p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {popularFonts.map((font) => (
                      <div
                        key={font}
                        className="font-preview-item p-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                        data-font={font}
                        onClick={() => handleFontSelected(font)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium">{font}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFontSelected(font);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                        <p 
                          style={{ 
                            fontFamily: `"${font}", sans-serif`, 
                            fontSize: `${previewSize}px`,
                            lineHeight: 1.2
                          }}
                          className="mt-1 break-words"
                        >
                          {sampleText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            {/* All fonts tab */}
            <TabsContent value="all">
              <ScrollArea className="h-[450px] rounded-md border p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categories.find(c => c.name === "All Fonts")?.fonts.filter(font => 
                      font.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((font) => (
                      <div
                        key={font}
                        className="font-preview-item p-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                        data-font={font}
                        onClick={() => handleFontSelected(font)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-medium">{font}</h4>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFontSelected(font);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                        <p 
                          style={{ 
                            fontFamily: `"${font}", sans-serif`, 
                            fontSize: `${previewSize}px`,
                            lineHeight: 1.2
                          }}
                          className="mt-1 break-words"
                        >
                          {sampleText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          {loadingBatch && (
            <div className="text-center text-sm text-neutral-500 flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Loading fonts...
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
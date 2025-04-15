import { useState, useEffect, useRef } from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Search, Type } from "lucide-react";
import googleFontsService from "../lib/googleFontsService";

interface FontCarouselPickerProps {
  currentFont: string;
  onFontSelected: (font: string) => void;
  sampleText?: string;
}

export default function FontCarouselPicker({
  currentFont,
  onFontSelected,
  sampleText = "The quick brown fox jumps over the lazy dog"
}: FontCarouselPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [allFonts, setAllFonts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentFontIndex, setCurrentFontIndex] = useState(0);
  const [visibleFonts, setVisibleFonts] = useState<string[]>([]);
  const [customText, setCustomText] = useState(sampleText);
  const [currentFontSet, setCurrentFontSet] = useState("all");
  const [hoverFont, setHoverFont] = useState<string | null>(null);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemsToShow = 3;

  // Load font data when component mounts
  useEffect(() => {
    const loadFontData = async () => {
      setIsLoading(true);
      try {
        const data = await googleFontsService.fetchGoogleFonts(currentFontSet);
        const fonts = data.fonts.map((font: any) => font.family);
        
        setAllFonts(fonts);
        setFilteredFonts(fonts);
        setCategories(data.categories);
        
        // Find the index of the current font
        const index = fonts.findIndex(f => f === currentFont);
        setCurrentFontIndex(index >= 0 ? index : 0);
        
        // Load the initial set of visible fonts
        updateVisibleFonts(index >= 0 ? index : 0, fonts);
        
        // Preload the visible fonts
        const visibleFontsList = getVisibleFonts(index >= 0 ? index : 0, fonts);
        googleFontsService.loadFonts(visibleFontsList);
      } catch (error) {
        console.error("Error loading fonts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      loadFontData();
    }
  }, [isOpen, currentFont, currentFontSet]);
  
  // Update filtered fonts when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      let fonts = [];
      
      if (activeCategory === "all") {
        fonts = allFonts;
      } else if (categories[activeCategory]) {
        fonts = categories[activeCategory];
      }
      
      setFilteredFonts(fonts);
      setCurrentFontIndex(0);
      updateVisibleFonts(0, fonts);
    } else {
      let searchPool = activeCategory === "all" 
        ? allFonts 
        : (categories[activeCategory] || []);
        
      const filtered = searchPool.filter(font => 
        font.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setFilteredFonts(filtered);
      setCurrentFontIndex(0);
      updateVisibleFonts(0, filtered);
    }
  }, [searchQuery, activeCategory, categories]);
  
  const getVisibleFonts = (startIndex: number, fontList: string[]) => {
    const fonts = [];
    for (let i = 0; i < itemsToShow; i++) {
      const index = (startIndex + i) % fontList.length;
      fonts.push(fontList[index]);
    }
    return fonts;
  };
  
  const updateVisibleFonts = (startIndex: number, fontList: string[]) => {
    if (fontList.length === 0) return;
    
    const fonts = getVisibleFonts(startIndex, fontList);
    setVisibleFonts(fonts);
    
    // Preload the next set of fonts for smoother navigation
    const nextFonts = getVisibleFonts(startIndex + itemsToShow, fontList);
    googleFontsService.loadFonts(nextFonts);
  };
  
  const handlePreviousFont = () => {
    if (filteredFonts.length === 0) return;
    
    const newIndex = currentFontIndex === 0 
      ? filteredFonts.length - 1 
      : currentFontIndex - 1;
      
    setCurrentFontIndex(newIndex);
    updateVisibleFonts(newIndex, filteredFonts);
  };
  
  const handleNextFont = () => {
    if (filteredFonts.length === 0) return;
    
    const newIndex = (currentFontIndex + 1) % filteredFonts.length;
    setCurrentFontIndex(newIndex);
    updateVisibleFonts(newIndex, filteredFonts);
  };
  
  const handleFontSelect = (font: string) => {
    onFontSelected(font);
    // Optionally close the popover
    // setIsOpen(false);
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    let fonts = [];
    if (category === "all") {
      fonts = allFonts;
    } else if (categories[category]) {
      fonts = categories[category];
    }
    
    setFilteredFonts(fonts);
    setCurrentFontIndex(0);
    updateVisibleFonts(0, fonts);
  };
  
  const handleFontSetChange = async (fontSet: string) => {
    setCurrentFontSet(fontSet);
    setIsLoading(true);
    
    try {
      const data = await googleFontsService.fetchGoogleFonts(fontSet);
      const fonts = data.fonts.map((font: any) => font.family);
      
      setAllFonts(fonts);
      setFilteredFonts(fonts);
      setCategories(data.categories);
      setCurrentFontIndex(0);
      updateVisibleFonts(0, fonts);
      
      // Preload the visible fonts
      const visibleFontsList = getVisibleFonts(0, fonts);
      googleFontsService.loadFonts(visibleFontsList);
    } catch (error) {
      console.error("Error loading fonts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="justify-between gap-2 font-normal border-dashed overflow-hidden text-ellipsis min-w-[140px] max-w-[200px]"
          style={{ fontFamily: currentFont }}
        >
          <span className="truncate">{currentFont}</span>
          <Type className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 max-h-[70vh] overflow-y-auto" align="start">
        <div className="space-y-4 p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Font Selection</h4>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleFontSetChange("all")}
            >
              All Fonts
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleFontSetChange("popular")}
            >
              Popular Only
            </Button>
          </div>
          
          <div className="border rounded-md p-2">
            <Input
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Sample text..."
              className="mb-2"
            />
            
            <div className="relative">
              <div
                ref={carouselRef}
                className="flex overflow-hidden space-x-1 py-2"
              >
                {isLoading ? (
                  <div className="w-full py-8 flex justify-center items-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : visibleFonts.length > 0 ? (
                  visibleFonts.map((font, i) => (
                    <div
                      key={`${font}-${i}`}
                      className={`
                        flex-1 p-3 border rounded-md cursor-pointer transition-all
                        ${font === currentFont ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'}
                        hover:scale-105 hover:shadow-md transform ease-in-out duration-200
                      `}
                      onClick={() => handleFontSelect(font)}
                      onMouseEnter={() => setHoverFont(font)}
                      onMouseLeave={() => setHoverFont(null)}
                    >
                      <div 
                        className="text-center"
                        style={{ fontFamily: font }}
                      >
                        <div className="text-xs text-muted-foreground mb-1 truncate font-sans">{font}</div>
                        <div className={`
                          h-16 overflow-hidden flex items-center justify-center text-sm md:text-base leading-tight
                          ${hoverFont === font ? 'scale-110 text-primary transition-all duration-200' : ''}
                        `}>
                          {customText}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center text-muted-foreground">
                    No fonts found.
                  </div>
                )}
              </div>
              
              {filteredFonts.length > itemsToShow && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={handlePreviousFont}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                    onClick={handleNextFont}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full flex-wrap">
              <TabsTrigger value="all" onClick={() => handleCategoryChange("all")}>
                All
              </TabsTrigger>
              <TabsTrigger value="sans-serif" onClick={() => handleCategoryChange("sans-serif")}>
                Sans
              </TabsTrigger>
              <TabsTrigger value="serif" onClick={() => handleCategoryChange("serif")}>
                Serif
              </TabsTrigger>
              <TabsTrigger value="display" onClick={() => handleCategoryChange("display")}>
                Display
              </TabsTrigger>
              <TabsTrigger value="handwriting" onClick={() => handleCategoryChange("handwriting")}>
                Script
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="text-xs text-muted-foreground text-center">
            {filteredFonts.length} fonts available
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
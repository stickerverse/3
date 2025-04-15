import { useState, useEffect, useRef } from "react";
import googleFontsService from "../lib/googleFontsService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FontGalleryProps {
  currentFont: string;
  onFontSelected: (font: string) => void;
  sampleText?: string;
  visible: boolean;
}

export default function FontGallery({
  currentFont,
  onFontSelected,
  sampleText = "The quick brown fox jumps over the lazy dog",
  visible
}: FontGalleryProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [displayFonts, setDisplayFonts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [customText, setCustomText] = useState(sampleText);
  const [hoveredFont, setHoveredFont] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  
  // Load all fonts when component mounts
  useEffect(() => {
    const loadFonts = async () => {
      if (!visible) return;
      
      setIsLoading(true);
      try {
        const data = await googleFontsService.fetchGoogleFonts("all");
        const fontList = data.fonts.map((font: any) => font.family);
        
        setFonts(fontList);
        setDisplayFonts(fontList.slice(0, 50)); // Initially show only first 50 fonts
        setCategories(data.categories);
        
        // Preload the visible fonts
        await googleFontsService.loadFonts(fontList.slice(0, 50));
      } catch (error) {
        console.error("Error loading fonts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFonts();
  }, [visible]);
  
  // Handle scroll to load more fonts
  useEffect(() => {
    if (!galleryRef.current || !visible) return;
    
    const handleScroll = () => {
      const container = galleryRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // If scrolled to bottom - 200px, load more fonts
      if (scrollHeight - scrollTop <= clientHeight + 200) {
        // Load next batch of fonts
        const currentLength = displayFonts.length;
        if (currentLength < fonts.length) {
          const filteredFonts = activeCategory === "all"
            ? fonts
            : categories[activeCategory] || [];
            
          const searchFiltered = searchQuery
            ? filteredFonts.filter(font => font.toLowerCase().includes(searchQuery.toLowerCase()))
            : filteredFonts;
          
          const nextBatch = searchFiltered.slice(currentLength, currentLength + 20);
          if (nextBatch.length > 0) {
            setDisplayFonts(prev => [...prev, ...nextBatch]);
            // Preload these fonts
            googleFontsService.loadFonts(nextBatch);
          }
        }
      }
    };
    
    const containerRef = galleryRef.current;
    containerRef.addEventListener("scroll", handleScroll);
    
    return () => {
      containerRef.removeEventListener("scroll", handleScroll);
    };
  }, [displayFonts, fonts, categories, activeCategory, searchQuery, visible]);
  
  // Handle search and category filter
  useEffect(() => {
    if (!visible) return;
    
    setIsLoading(true);
    
    let filteredFonts = activeCategory === "all"
      ? fonts
      : categories[activeCategory] || [];
      
    if (searchQuery) {
      filteredFonts = filteredFonts.filter(font => 
        font.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Reset to show only first batch of filtered fonts
    setDisplayFonts(filteredFonts.slice(0, 50));
    
    // Preload the visible fonts
    googleFontsService.loadFonts(filteredFonts.slice(0, 50));
    
    setIsLoading(false);
  }, [searchQuery, activeCategory, visible]);
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  // If component is not visible, don't render anything
  if (!visible) return null;
  
  return (
    <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Font Gallery</h3>
        
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Input
            placeholder="Sample text..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-64"
          />
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full mb-4">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="all" onClick={() => handleCategoryChange("all")}>
            All Fonts
          </TabsTrigger>
          <TabsTrigger value="sans-serif" onClick={() => handleCategoryChange("sans-serif")}>
            Sans Serif
          </TabsTrigger>
          <TabsTrigger value="serif" onClick={() => handleCategoryChange("serif")}>
            Serif
          </TabsTrigger>
          <TabsTrigger value="display" onClick={() => handleCategoryChange("display")}>
            Display
          </TabsTrigger>
          <TabsTrigger value="handwriting" onClick={() => handleCategoryChange("handwriting")}>
            Handwriting
          </TabsTrigger>
          <TabsTrigger value="monospace" onClick={() => handleCategoryChange("monospace")}>
            Monospace
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div 
        ref={galleryRef}
        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 h-56 overflow-y-auto p-2 border rounded-md"
      >
        {isLoading && displayFonts.length === 0 ? (
          <div className="col-span-full h-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : displayFonts.length > 0 ? (
          displayFonts.map((font) => (
            <div
              key={font}
              className={`
                p-3 border rounded-md cursor-pointer transition-all
                ${font === currentFont ? 'border-primary bg-primary/5' : 'border-neutral-200 dark:border-neutral-700 hover:border-primary/50'}
                hover:shadow-md
              `}
              onClick={() => onFontSelected(font)}
              onMouseEnter={() => setHoveredFont(font)}
              onMouseLeave={() => setHoveredFont(null)}
            >
              <div className="text-center" style={{ fontFamily: font }}>
                <div className="text-xs text-muted-foreground mb-1 truncate font-sans">{font}</div>
                <div className={`
                  h-16 overflow-hidden flex items-center justify-center text-sm leading-tight
                  ${hoveredFont === font ? 'scale-105 text-primary transition-all duration-200' : ''}
                `}>
                  {customText}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full h-full flex items-center justify-center text-muted-foreground">
            No fonts found matching your search.
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground mt-2 text-center">
        {displayFonts.length} of {activeCategory === "all" 
          ? fonts.length 
          : categories[activeCategory]?.length || 0} fonts • 
        Scroll to load more
      </div>
    </div>
  );
}
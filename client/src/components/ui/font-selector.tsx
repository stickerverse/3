import { useState, useEffect, useRef } from "react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Button 
} from "@/components/ui/button";
import { 
  ScrollArea 
} from "@/components/ui/scroll-area";
import { Search, X, Check, ChevronDown } from "lucide-react";
import googleFontsService from "@/lib/googleFontsService";

interface FontSelectorProps {
  value?: string;
  onFontSelect?: (font: string) => void;
  placeholder?: string;
  showCategories?: boolean;
}

const FontSelector = ({ 
  value = "Arial", 
  onFontSelect, 
  placeholder = "Select font...",
  showCategories = true 
}: FontSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fonts, setFonts] = useState<string[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFont, setLoadingFont] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load initial fonts data
  useEffect(() => {
    const loadFontData = async () => {
      try {
        setIsLoading(true);
        const fontData = await googleFontsService.fetchGoogleFonts();
        setFonts(fontData.fonts.map((font: any) => font.family));
        setCategories(fontData.categories);
        setFilteredFonts(fontData.fonts.map((font: any) => font.family));
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading fonts:", error);
        setIsLoading(false);
      }
    };

    loadFontData();
  }, []);

  // Filter fonts based on search and category
  useEffect(() => {
    if (fonts.length === 0) return;

    let filtered = [...fonts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(font => 
        font.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== "all" && categories[selectedCategory]) {
      filtered = filtered.filter(font => 
        categories[selectedCategory].includes(font)
      );
    }
    
    // No limit on the number of fonts returned
    // Previously we were limiting to 100 fonts, but now we show all matches

    setFilteredFonts(filtered);
  }, [searchQuery, selectedCategory, fonts, categories]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle font selection
  const handleFontSelect = async (font: string) => {
    try {
      if (!googleFontsService.isFontLoaded(font)) {
        setLoadingFont(font);
        await googleFontsService.loadFonts([font]);
      }
      
      if (onFontSelect) {
        onFontSelect(font);
      }
      
      setIsOpen(false);
      setSearchQuery("");
      setLoadingFont("");
    } catch (error) {
      console.error("Error loading font:", error);
      setLoadingFont("");
    }
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Get sample text for preview
  const getSampleText = () => "The quick brown fox jumps over the lazy dog";

  // Render a font item in the list
  const renderFontItem = (font: string) => {
    const isSelected = font === value;
    const isLoading = loadingFont === font;
    
    return (
      <div
        key={font}
        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-md ${
          isSelected ? "bg-primary/10 text-primary font-medium" : ""
        }`}
        onClick={() => handleFontSelect(font)}
      >
        <span style={{ fontFamily: font }} className="flex-1 truncate">
          {font}
        </span>
        <div className="flex items-center">
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          )}
          {isSelected && <Check className="h-4 w-4 text-primary" />}
        </div>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
          <div className="flex items-center gap-2 flex-1">
            <span style={{ fontFamily: value }} className="truncate">
              {value}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search fonts..."
              className="pl-8 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {showCategories && (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <div className="border-b px-1">
              <ScrollArea className="w-full">
                <div className="flex overflow-x-auto">
                  <TabsList className="w-max px-1 py-1">
                    <TabsTrigger value="all" className="text-xs">
                      All Fonts
                    </TabsTrigger>
                    {Object.keys(categories).map((category) => (
                      <TabsTrigger key={category} value={category} className="text-xs">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        )}

        <ScrollArea className="h-72">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2 text-sm">Loading fonts...</span>
            </div>
          ) : filteredFonts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No fonts found.
            </div>
          ) : (
            <div className="p-2 grid gap-1">
              {filteredFonts.map(renderFontItem)}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <div className="text-xs text-muted-foreground">
            Preview:
          </div>
          <div 
            className="mt-1 p-2 border rounded-md text-sm" 
            style={{ fontFamily: value }}
          >
            {getSampleText()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FontSelector;
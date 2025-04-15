
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowLeft } from "lucide-react";
import { 
  fetchGoogleFonts,
  fetchLocalFonts,
  loadFontBatch,
  isFontLoaded
} from "@/lib/fontLoader";

interface FontShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFont: (fontFamily: string) => void;
  currentFont: string;
}

export default function FontShowcase({
  isOpen,
  onClose,
  onSelectFont,
  currentFont
}: FontShowcaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [favoritesFonts, setFavoritesFonts] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(24);
  
  // Load fonts when component mounts
  useEffect(() => {
    if (!isOpen) return;
    
    const loadFonts = async () => {
      setIsLoading(true);
      try {
        // Fetch categories from Google Fonts API
        const data = await fetchGoogleFonts();
        setCategories(data.categories);
        
        // Get all fonts and load the most popular ones
        const allFonts = Object.values(data.categories).flat();
        setFilteredFonts(allFonts);
        
        // Load the first 20 fonts for immediate preview
        const popularFonts = data.fonts.slice(0, 20).map(font => font.family);
        await loadFontBatch(popularFonts);
        
        // Load user favorites if any
        try {
          const savedFavorites = localStorage.getItem('favoriteFonts');
          if (savedFavorites) {
            setFavoritesFonts(new Set(JSON.parse(savedFavorites)));
          }
        } catch (error) {
          console.error('Error loading favorite fonts:', error);
        }
        
        // Also load local fonts
        const localFontsList = await fetchLocalFonts();
        if (localFontsList.length > 0) {
          // Add local fonts to categories
          setCategories(prev => ({
            ...prev,
            'local': localFontsList.map(f => f.family)
          }));
        }
      } catch (error) {
        console.error("Error loading fonts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFonts();
  }, [isOpen]);
  
  // Filter fonts based on search query
  useEffect(() => {
    if (isLoading || Object.keys(categories).length === 0) return;
    
    // Get all fonts from all categories
    const allFonts = Object.values(categories).flat();
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = allFonts.filter(font => 
        font.toLowerCase().includes(query)
      );
      setFilteredFonts(filtered);
    } else {
      setFilteredFonts(allFonts);
    }
  }, [searchQuery, categories, isLoading]);

  // Toggle a font as favorite
  const toggleFavorite = (fontFamily: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const newFavorites = new Set(favoritesFonts);
    
    if (newFavorites.has(fontFamily)) {
      newFavorites.delete(fontFamily);
    } else {
      newFavorites.add(fontFamily);
    }
    
    setFavoritesFonts(newFavorites);
    
    // Store in localStorage
    try {
      localStorage.setItem('favoriteFonts', JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Error saving favorite fonts:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold">Font Showcase</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="px-3 py-1 border rounded-md text-sm"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          >
            {[16, 18, 20, 24, 32, 40, 48].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="p-4 flex flex-col sm:flex-row gap-4">
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
      
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-3">Loading fonts...</span>
        </div>
      ) : (
        <ScrollArea className="flex-1 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredFonts.map((font) => (
              <div 
                key={font}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  currentFont === font ? 'border-primary-500 border-2 bg-primary-50 dark:bg-primary-900/10' : ''
                }`}
                onClick={() => onSelectFont(font)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="truncate max-w-[70%]">
                    <span className="font-medium">{font}</span>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => toggleFavorite(font, e)}
                      className={`${favoritesFonts.has(font) ? 'text-amber-500' : 'text-neutral-300'} hover:text-amber-500 transition-colors`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {currentFont === font && (
                      <span className="ml-2 text-xs bg-primary px-2 py-0.5 rounded text-white">Selected</span>
                    )}
                  </div>
                </div>
                
                <div className="h-20 flex items-center justify-center">
                  {isFontLoaded(font) ? (
                    <p 
                      style={{ 
                        fontFamily: `'${font}', sans-serif`,
                        fontSize: `${fontSize}px`
                      }}
                      className="text-center line-clamp-2"
                    >
                      {previewText}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mb-2"></div>
                      <span className="text-xs text-neutral-500">Loading...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

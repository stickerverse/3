import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, PlusCircle, Star, Clock, ArrowUpDown, ChevronDown, Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { 
  fontCategories as defaultFontCategories, 
  loadFontsByCategory,
  fetchGoogleFonts,
  fetchLocalFonts,
  loadLocalFont,
  isFontLoaded,
  loadFontBatch
} from "@/lib/fontLoader";
import WebFont from "webfontloader";
import FontUploader from "./FontUploader";

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
  const [localFonts, setLocalFonts] = useState<Array<{
    family: string, 
    fileName: string, 
    url: string, 
    category: string, 
    isLocal: boolean
  }>>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState("regular");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "detail">("grid");
  const [sortOrder, setSortOrder] = useState<"popularity" | "alpha" | "recent">("popularity");
  const [focusedFontIndex, setFocusedFontIndex] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [favoritesFonts, setFavoritesFonts] = useState<Set<string>>(new Set());
  
  // References
  const fontGridRef = useRef<HTMLDivElement>(null);
  
  // Use Google Fonts categories from API if available, otherwise use default categories
  const allCategories = apiCategories || defaultFontCategories;
  
  // Initial load of categories from Google Fonts API and local fonts
  useEffect(() => {
    const loadFonts = async () => {
      if (!showFontPreview) return;
      
      setIsLoadingCategories(true);
      
      try {
        // Fetch categories from Google Fonts API
        const data = await fetchGoogleFonts();
        setApiCategories(data.categories);
        
        // Set popular fonts for recommendations
        setPopularFonts(data.fonts.slice(0, 60).map(font => ({
          family: font.family,
          category: font.category
        })));
        
        // Pre-load the most popular fonts in batches for better user experience
        const popularFontFamilies = data.fonts.slice(0, 20).map(font => font.family);
        const batches = [];
        const batchSize = 5;
        
        for (let i = 0; i < popularFontFamilies.length; i += batchSize) {
          batches.push(popularFontFamilies.slice(i, i + batchSize));
        }
        
        // Load fonts in batches to show progress
        let loadedCount = 0;
        for (const batch of batches) {
          try {
            await loadFontBatch(batch);
            loadedCount += batch.length;
            setLoadingProgress(Math.floor((loadedCount / popularFontFamilies.length) * 100));
          } catch (error) {
            console.error('Error loading font batch:', error);
          }
        }
        
        // Fetch and load local fonts
        const localFontsList = await fetchLocalFonts();
        setLocalFonts(localFontsList);
        
        // Add local category if there are local fonts
        if (localFontsList.length > 0) {
          // Create a deep copy of the categories
          const categoriesWithLocal = { 
            ...data.categories,
            'local': localFontsList.map(f => f.family)
          };
          setApiCategories(categoriesWithLocal);
          
          // Load all local fonts
          for (const localFont of localFontsList) {
            try {
              await loadLocalFont(localFont.family, localFont.url);
            } catch (err) {
              console.error(`Failed to load local font ${localFont.family}:`, err);
            }
          }
        }
        
        // Load favorites from localStorage if available
        try {
          const savedFavorites = localStorage.getItem('favoriteFonts');
          if (savedFavorites) {
            setFavoritesFonts(new Set(JSON.parse(savedFavorites)));
          }
        } catch (error) {
          console.error('Error loading favorite fonts:', error);
        }
        
      } catch (error) {
        console.error('Failed to load fonts:', error);
      } finally {
        setIsLoadingCategories(false);
        setLoadingProgress(100);
      }
    };
    
    loadFonts();
  }, [showFontPreview]);
  
  // Get all fonts from all categories
  const allFonts = Object.values(allCategories).flat();

  // Filter and sort fonts based on search, category, and sort order
  useEffect(() => {
    if (isLoadingCategories) return;
    
    let fonts: string[] = [];
    
    if (selectedCategory === "all") {
      // Always include all fonts in the "all" category
      fonts = allFonts;
    } else if (selectedCategory === "favorites") {
      // Show favorite fonts
      fonts = allFonts.filter(font => favoritesFonts.has(font));
    } else {
      // Get fonts for the selected category
      fonts = allCategories[selectedCategory] || [];
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fonts = fonts.filter(font => font.toLowerCase().includes(query));
    }
    
    // Sort fonts based on selected sort order
    if (sortOrder === "alpha") {
      fonts.sort((a, b) => a.localeCompare(b));
    } else if (sortOrder === "recent") {
      // Recent would normally be based on usage history, but we'll use a mix here
      // For this example, we prioritize favorites and then popular fonts
      const favoritesSet = new Set(Array.from(favoritesFonts));
      const popularFamilies = popularFonts.map(f => f.family);
      
      fonts.sort((a, b) => {
        // First sort by favorites
        if (favoritesSet.has(a) && !favoritesSet.has(b)) return -1;
        if (!favoritesSet.has(a) && favoritesSet.has(b)) return 1;
        
        // Then by popularity
        const aIndex = popularFamilies.indexOf(a);
        const bIndex = popularFamilies.indexOf(b);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Finally alphabetically
        return a.localeCompare(b);
      });
    } else {
      // Default popularity sort - use order from popularFonts if available
      const popularFamilies = popularFonts.map(f => f.family);
      
      fonts.sort((a, b) => {
        const aIndex = popularFamilies.indexOf(a);
        const bIndex = popularFamilies.indexOf(b);
        
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        return a.localeCompare(b);
      });
    }
    
    setFilteredFonts(fonts);
  }, [searchQuery, selectedCategory, allCategories, allFonts, isLoadingCategories, sortOrder, favoritesFonts, popularFonts]);

  // Load fonts for the selected category when tab changes
  useEffect(() => {
    const loadFontsForCategory = async () => {
      if (selectedCategory === "all" || selectedCategory === "favorites" || loadedCategories.has(selectedCategory)) {
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
        timeout: 5000 // 5 second timeout
      });
    });
  };

  // Handle font selection with loading if needed
  const handleSelectFont = async (font: string) => {
    try {
      // Check if it's a local font
      const localFont = localFonts.find(f => f.family === font);
      if (localFont) {
        // For local fonts, we use the loadLocalFont function
        await loadLocalFont(font, localFont.url);
      } else {
        // For Google fonts, use WebFont
        await ensureFontLoaded(font);
      }
      
      // Update the current font
      setFont(font);
      
      // Close the dialog if in detail view for better UX
      if (viewMode === "detail") {
        setShowFontPreview(false);
      }
    } catch (error) {
      console.error("Error loading font:", error);
      // Load the font anyway as it might still work
      setFont(font);
    }
  };
  
  // Handle successful font upload
  const handleFontUploaded = async (font: { family: string, fileName: string, url: string }) => {
    try {
      // Load the newly uploaded font
      await loadLocalFont(font.family, font.url);
      
      // Refresh local fonts list
      const localFontsList = await fetchLocalFonts();
      setLocalFonts(localFontsList);
      
      // Add or update local category
      if (apiCategories) {
        const updatedCategories = { 
          ...apiCategories,
          'local': localFontsList.map(f => f.family)
        };
        setApiCategories(updatedCategories);
      }
      
      // Select the newly uploaded font
      setFont(font.family);
      
      // Switch to local category tab
      setSelectedCategory('local');
    } catch (error) {
      console.error("Error handling uploaded font:", error);
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
  
  // Toggle a font as favorite
  const toggleFavorite = (fontFamily: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
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
  
  // View a specific font in detail mode
  const viewFontDetail = (fontFamily: string, index: number) => {
    const fontIndex = filteredFonts.indexOf(fontFamily);
    setFocusedFontIndex(fontIndex);
    setViewMode("detail");
  };
  
  // Navigate to previous or next font in detail view
  const navigateFont = (direction: 'prev' | 'next') => {
    if (focusedFontIndex === null || filteredFonts.length === 0) return;
    
    let newIndex = focusedFontIndex + (direction === 'next' ? 1 : -1);
    
    // Wrap around if needed
    if (newIndex < 0) newIndex = filteredFonts.length - 1;
    if (newIndex >= filteredFonts.length) newIndex = 0;
    
    setFocusedFontIndex(newIndex);
    
    // Ensure the font is loaded
    const fontFamily = filteredFonts[newIndex];
    ensureFontLoaded(fontFamily).catch(error => {
      console.error(`Error loading font ${fontFamily}:`, error);
    });
  };
  
  // Prepare font weights to show in detail view
  const fontWeights = [
    { value: "300", label: "Light" },
    { value: "regular", label: "Regular" },
    { value: "500", label: "Medium" },
    { value: "700", label: "Bold" },
    { value: "900", label: "Black" }
  ];
  
  // Preload the next few fonts for smoother navigation in detail view
  useEffect(() => {
    if (viewMode !== "detail" || focusedFontIndex === null) return;
    
    const preloadNext = async () => {
      const preloadCount = 3; // How many fonts to preload ahead and behind
      const fonts = [];
      
      for (let i = 1; i <= preloadCount; i++) {
        // Preload next fonts
        const nextIndex = (focusedFontIndex + i) % filteredFonts.length;
        fonts.push(filteredFonts[nextIndex]);
        
        // Preload previous fonts
        const prevIndex = (focusedFontIndex - i + filteredFonts.length) % filteredFonts.length;
        fonts.push(filteredFonts[prevIndex]);
      }
      
      const uniqueFonts = [...new Set(fonts)];
      
      // Load these fonts in the background
      try {
        await loadFontBatch(uniqueFonts);
      } catch (error) {
        console.error('Error preloading fonts:', error);
      }
    };
    
    preloadNext();
  }, [focusedFontIndex, filteredFonts, viewMode]);

  return (
    <Dialog open={showFontPreview} onOpenChange={setShowFontPreview}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Font Preview Gallery</DialogTitle>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Browse from over 1,000 Google Fonts to find the perfect style for your design
          </p>
        </DialogHeader>
        
        {/* Search and Preview Text Input */}
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
          <div className="flex justify-center items-center h-64 flex-col">
            <div className="w-64 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Loading Google Fonts... {loadingProgress}%</p>
              <p className="text-xs text-neutral-500">Pre-loading the most popular fonts for better browsing experience</p>
            </div>
          </div>
        ) : viewMode === "detail" && focusedFontIndex !== null && filteredFonts.length > 0 ? (
          // DETAIL VIEW - Single font detailed view
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Font Gallery</span>
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateFont('prev')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateFont('next')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 flex-1 overflow-y-auto">
              {(() => {
                const fontFamily = filteredFonts[focusedFontIndex];
                return (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{fontFamily}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">{getFontCategory(fontFamily)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => toggleFavorite(fontFamily, e)}
                          className={`hover:text-primary transition-colors ${favoritesFonts.has(fontFamily) ? 'text-primary' : 'text-neutral-400'}`}
                          aria-label={favoritesFonts.has(fontFamily) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className="w-5 h-5" fill={favoritesFonts.has(fontFamily) ? "currentColor" : "none"} />
                        </button>
                        
                        <Button
                          variant="default"
                          onClick={() => handleSelectFont(fontFamily)}
                        >
                          {currentFont === fontFamily ? "Selected" : "Select Font"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                          <select 
                            className="px-3 py-1 border rounded-md text-sm"
                            value={fontWeight}
                            onChange={(e) => setFontWeight(e.target.value)}
                          >
                            {fontWeights.map(weight => (
                              <option key={weight.value} value={weight.value}>{weight.label}</option>
                            ))}
                          </select>
                          
                          <select 
                            className="px-3 py-1 border rounded-md text-sm"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                          >
                            {[16, 18, 20, 24, 32, 40, 48, 64, 80].map(size => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div 
                        className="p-6 border rounded-lg min-h-[180px] flex items-center justify-center"
                      >
                        <p
                          style={{ 
                            fontFamily: `'${fontFamily}', sans-serif`, 
                            fontSize: `${fontSize}px`,
                            fontWeight: fontWeight === 'regular' ? 'normal' : fontWeight
                          }}
                          className="text-center transition-all overflow-hidden"
                        >
                          {previewText || "The quick brown fox jumps over the lazy dog."}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Character Set</p>
                          <p 
                            style={{ fontFamily: `'${fontFamily}', sans-serif` }}
                            className="text-sm"
                          >
                            ABCDEFGHIJKLMNOPQRSTUVWXYZ
                          </p>
                          <p 
                            style={{ fontFamily: `'${fontFamily}', sans-serif` }}
                            className="text-sm"
                          >
                            abcdefghijklmnopqrstuvwxyz
                          </p>
                          <p 
                            style={{ fontFamily: `'${fontFamily}', sans-serif` }}
                            className="text-sm"
                          >
                            0123456789.,;:?!@#$%^&*()
                          </p>
                        </div>
                        
                        <div className="border rounded-lg p-4">
                          <p className="text-sm font-medium mb-2">Sample Text</p>
                          <p 
                            style={{ fontFamily: `'${fontFamily}', sans-serif` }}
                            className="text-sm"
                          >
                            Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line-spacing, and letter-spacing, and adjusting the space between pairs of letters.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          // GRID VIEW - Multiple fonts overview
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1">
                <TabsList className="flex flex-wrap justify-start">
                  <TabsTrigger value="all">All Fonts</TabsTrigger>
                  <TabsTrigger value="favorites">
                    <Heart className="h-3 w-3 mr-1" />
                    Favorites
                  </TabsTrigger>
                  {Object.keys(allCategories).map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs text-neutral-500">Sort:</span>
                <select 
                  className="text-xs p-1 border rounded"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                >
                  <option value="popularity">Popular</option>
                  <option value="alpha">A-Z</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {filteredFonts.length} fonts found
              </span>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowUploader(true)}
                  className="flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Font</span>
                </Button>
                
                <div className="flex border rounded overflow-hidden">
                  <button
                    className={`p-1 px-2 ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button
                    className={`p-1 px-2 ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1 border rounded-md p-4" ref={fontGridRef}>
              {isLoadingFonts ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading fonts...</p>
                  </div>
                </div>
              ) : (
                <>
                  {filteredFonts.length === 0 ? (
                    <div className="text-center p-8 text-neutral-500">
                      {selectedCategory === "favorites" ? (
                        <>
                          <Heart className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
                          <p>No favorite fonts yet. Click the heart icon on any font to add it to your favorites.</p>
                        </>
                      ) : (
                        <p>No fonts match your search criteria</p>
                      )}
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredFonts.map((font, index) => (
                        <div 
                          key={`font-${font}`}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            currentFont === font ? 'border-primary border-2 bg-primary/5' : 'border-neutral-200 dark:border-neutral-700'
                          }`}
                          onClick={() => handleSelectFont(font)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium truncate max-w-[180px]">
                                {font}
                              </span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {getFontCategory(font)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentFont === font && (
                                <Badge variant="default" className="ml-2">Selected</Badge>
                              )}
                              <button
                                onClick={(e) => toggleFavorite(font, e)}
                                className={`hover:text-primary transition-colors ${favoritesFonts.has(font) ? 'text-primary' : 'text-neutral-400'}`}
                                aria-label={favoritesFonts.has(font) ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart className="w-4 h-4" fill={favoritesFonts.has(font) ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>
                          <div 
                            className="h-20 flex items-center justify-center overflow-hidden relative"
                            onDoubleClick={() => viewFontDetail(font, index)}
                          >
                            <span 
                              className="text-2xl text-center"
                              style={{ fontFamily: `'${font}', sans-serif` }}
                            >
                              {previewText || "Your Text Here"}
                            </span>
                            
                            {!isFontLoaded(font) && (
                              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex justify-end">
                            <button 
                              className="text-xs text-primary hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewFontDetail(font, index);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // List view
                    <div className="space-y-2">
                      {filteredFonts.map((font, index) => (
                        <div 
                          key={`font-${font}`}
                          className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md flex items-center ${
                            currentFont === font ? 'border-primary border-2 bg-primary/5' : 'border-neutral-200 dark:border-neutral-700'
                          }`}
                          onClick={() => handleSelectFont(font)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">
                                {font}
                              </span>
                              <span className="text-xs text-muted-foreground capitalize bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                                {getFontCategory(font)}
                              </span>
                              {currentFont === font && (
                                <Badge variant="default" className="ml-2">Selected</Badge>
                              )}
                            </div>
                            <div className="mt-1 relative">
                              <span 
                                className="text-lg"
                                style={{ fontFamily: `'${font}', sans-serif` }}
                              >
                                {previewText || "Your Text Here"}
                              </span>
                              
                              {!isFontLoaded(font) && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => toggleFavorite(font, e)}
                              className={`hover:text-primary transition-colors ${favoritesFonts.has(font) ? 'text-primary' : 'text-neutral-400'}`}
                              aria-label={favoritesFonts.has(font) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart className="w-4 h-4" fill={favoritesFonts.has(font) ? "currentColor" : "none"} />
                            </button>
                            <button 
                              className="text-xs text-primary hover:underline p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                viewFontDetail(font, index);
                              }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </ScrollArea>
          </div>
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
      
      {/* Font Uploader */}
      <FontUploader 
        showUploader={showUploader}
        setShowUploader={setShowUploader}
        onFontUploaded={handleFontUploaded}
      />
    </Dialog>
  );
}
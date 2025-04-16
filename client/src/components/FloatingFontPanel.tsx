import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, Heart, X, Star, Clock, Check, Info, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import LocalFontPreviewer from '@/components/LocalFontPreviewer';
import FontComparison from '@/components/FontComparison';
import FontGallery from '@/components/FontGallery';
import FontWeightStylePreview from '@/components/FontWeightStylePreview';
import googleFontsService from "@/lib/googleFontsService";

interface FloatingFontPanelProps {
  onFontSelected: (fontFamily: string, options?: { weight?: number, isItalic?: boolean, isUnderlined?: boolean }) => void;
  currentFont?: string;
}

type FontCategory = {
  name: string;
  fonts: string[];
  icon: React.ReactNode;
};

export default function FloatingFontPanel({
  onFontSelected,
  currentFont
}: FloatingFontPanelProps) {
  // States for navigation and panel control
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFontTab, setActiveFontTab] = useState<string>("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentFonts, setRecentFonts] = useState<string[]>([]);
  const [popularFonts, setPopularFonts] = useState<string[]>([]);
  const [allFonts, setAllFonts] = useState<string[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [categories, setCategories] = useState<FontCategory[]>([
    { name: "Favorites", fonts: [], icon: <Heart className="h-4 w-4 text-red-500" /> },
    { name: "Recent", fonts: [], icon: <Clock className="h-4 w-4 text-blue-500" /> },
    { name: "Popular", fonts: [], icon: <Star className="h-4 w-4 text-yellow-500" /> },
    { name: "Sans-serif", fonts: [], icon: <Info className="h-4 w-4" /> },
    { name: "Serif", fonts: [], icon: <Info className="h-4 w-4" /> },
    { name: "Display", fonts: [], icon: <Info className="h-4 w-4" /> },
    { name: "Handwriting", fonts: [], icon: <Info className="h-4 w-4" /> },
    { name: "Monospace", fonts: [], icon: <Info className="h-4 w-4" /> },
  ]);
  
  // Toggle expanded/collapsed state
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Load fonts and categories
  useEffect(() => {
    async function loadFonts() {
      try {
        // Load system fonts
        await googleFontsService.ensureSystemFontsLoaded();
        const systemFonts = googleFontsService.getSystemFonts();
        
        // Set up some initial data
        const popular = systemFonts.slice(0, 10); // First 10 fonts as popular
        
        // Load Google fonts for categories
        const categories = googleFontsService.getFontCategories();
        
        setAllFonts(systemFonts);
        setPopularFonts(popular);
        
        // Update categories with real fonts
        setCategories(prevCategories => {
          return prevCategories.map(category => {
            // Find matching fonts for each category
            if (category.name === "Popular") {
              return { ...category, fonts: popular };
            } else if (category.name === "Recent") {
              return { ...category, fonts: recentFonts };
            } else if (category.name === "Favorites") {
              return { ...category, fonts: favorites };
            } else {
              // For other categories, find by category name
              const matchingFonts = systemFonts.filter(font => 
                googleFontsService.getFontCategory(font)?.toLowerCase() === category.name.toLowerCase()
              );
              return { ...category, fonts: matchingFonts.slice(0, 30) }; // Limit to 30 fonts per category
            }
          });
        });
      } catch (error) {
        console.error("Error loading fonts:", error);
      }
    }
    
    loadFonts();
  }, [favorites, recentFonts]);
  
  // Filter fonts when search changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredFonts([]);
      return;
    }
    
    const results = allFonts.filter(font => 
      font.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredFonts(results);
  }, [searchQuery, allFonts]);
  
  // Toggle font in favorites
  const toggleFavorite = (font: string) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(font)) {
        return prevFavorites.filter(f => f !== font);
      } else {
        return [...prevFavorites, font];
      }
    });
  };
  
  // Add font to recent fonts when selected
  const handleFontSelected = (font: string, options?: { weight?: number, isItalic?: boolean, isUnderlined?: boolean }) => {
    // Add to recent fonts if not already there
    setRecentFonts(prev => {
      const filtered = prev.filter(f => f !== font); // Remove if exists
      return [font, ...filtered].slice(0, 10); // Add to start and keep only 10
    });
    
    // Call the original handler
    onFontSelected(font, options);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="fixed right-0 top-[60px] bottom-0 flex h-[calc(100vh-60px)] z-40">      
      {/* Collapsible Toggle Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-md z-50"
        >
          {isExpanded ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </div>
      
      {/* Content Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-[350px] transition-all duration-300 overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-3">
            <h2 className="text-lg font-medium">Font Properties</h2>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fonts..."
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-2 top-2.5" 
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-auto">
            <Tabs 
              defaultValue={activeFontTab} 
              onValueChange={setActiveFontTab} 
              className="w-full h-full"
            >
              <div className="px-4 pt-3">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="quick">Quick</TabsTrigger>
                  <TabsTrigger value="browse">Browse</TabsTrigger>
                  <TabsTrigger value="compare">Compare</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                  <TabsTrigger value="styles"><Sliders className="h-4 w-4" /></TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-4 h-[calc(100%-60px)]">
                {/* Search Results */}
                {searchQuery && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2">Search Results ({filteredFonts.length})</h3>
                    <ScrollArea className="h-[200px] rounded-md border">
                      <div className="p-4">
                        {filteredFonts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No fonts found</p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2">
                            {filteredFonts.map(font => (
                              <div 
                                key={font} 
                                className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                  currentFont === font ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                }`}
                                onClick={() => handleFontSelected(font)}
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="text-lg"
                                    style={{ fontFamily: font }}
                                  >
                                    Aa
                                  </div>
                                  <span className="text-sm truncate max-w-[180px]" title={font}>
                                    {font}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  {currentFont === font && (
                                    <Check className="h-4 w-4 text-primary mr-1" />
                                  )}
                                  <button
                                    className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(font);
                                    }}
                                  >
                                    <Heart 
                                      className={`h-4 w-4 ${
                                        favorites.includes(font) 
                                          ? 'text-red-500 fill-red-500' 
                                          : 'text-neutral-400'
                                      }`} 
                                    />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              
                <TabsContent value="quick" className="h-full mt-0 overflow-auto">
                  {!searchQuery && (
                    <>
                      {/* Current Font */}
                      {currentFont && (
                        <div className="mb-4">
                          <h3 className="text-sm font-medium mb-2">Current Font</h3>
                          <div 
                            className="flex items-center justify-between p-3 rounded-md border"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="text-3xl"
                                style={{ fontFamily: currentFont }}
                              >
                                Aa
                              </div>
                              <div>
                                <div className="font-medium text-sm">{currentFont}</div>
                                <div className="text-xs text-muted-foreground">
                                  {googleFontsService.getFontCategory(currentFont) || 'System Font'}
                                </div>
                              </div>
                            </div>
                            <button
                              className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600"
                              onClick={() => toggleFavorite(currentFont)}
                            >
                              <Heart 
                                className={`h-4 w-4 ${
                                  favorites.includes(currentFont) 
                                    ? 'text-red-500 fill-red-500' 
                                    : 'text-neutral-400'
                                }`} 
                              />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Favorite Fonts */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium">Favorites</h3>
                          <span className="text-xs text-muted-foreground">{favorites.length} fonts</span>
                        </div>
                        
                        {favorites.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Click the heart icon to add fonts to your favorites
                          </p>
                        ) : (
                          <ScrollArea className="h-[120px] rounded-md border">
                            <div className="p-2">
                              <div className="grid grid-cols-1 gap-1">
                                {favorites.map(font => (
                                  <div 
                                    key={font} 
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                      currentFont === font ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                    }`}
                                    onClick={() => handleFontSelected(font)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="text-lg"
                                        style={{ fontFamily: font }}
                                      >
                                        Aa
                                      </div>
                                      <span className="text-sm truncate max-w-[180px]" title={font}>
                                        {font}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      {currentFont === font && (
                                        <Check className="h-4 w-4 text-primary mr-1" />
                                      )}
                                      <button
                                        className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(font);
                                        }}
                                      >
                                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                      
                      {/* Recently Used Fonts */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium">Recently Used</h3>
                          <span className="text-xs text-muted-foreground">{recentFonts.length} fonts</span>
                        </div>
                        
                        {recentFonts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            Your recently used fonts will appear here
                          </p>
                        ) : (
                          <ScrollArea className="h-[120px] rounded-md border">
                            <div className="p-2">
                              <div className="grid grid-cols-1 gap-1">
                                {recentFonts.map(font => (
                                  <div 
                                    key={font} 
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                      currentFont === font ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                    }`}
                                    onClick={() => handleFontSelected(font)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="text-lg"
                                        style={{ fontFamily: font }}
                                      >
                                        Aa
                                      </div>
                                      <span className="text-sm truncate max-w-[180px]" title={font}>
                                        {font}
                                      </span>
                                    </div>
                                    <div className="flex items-center">
                                      {currentFont === font && (
                                        <Check className="h-4 w-4 text-primary mr-1" />
                                      )}
                                      <button
                                        className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(font);
                                        }}
                                      >
                                        <Heart 
                                          className={`h-4 w-4 ${
                                            favorites.includes(font) 
                                              ? 'text-red-500 fill-red-500' 
                                              : 'text-neutral-400'
                                          }`} 
                                        />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                      
                      {/* Popular Fonts */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium">Popular Fonts</h3>
                        </div>
                        
                        <ScrollArea className="h-[120px] rounded-md border">
                          <div className="p-2">
                            <div className="grid grid-cols-1 gap-1">
                              {popularFonts.map(font => (
                                <div 
                                  key={font} 
                                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                                    currentFont === font ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                  }`}
                                  onClick={() => handleFontSelected(font)}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="text-lg"
                                      style={{ fontFamily: font }}
                                    >
                                      Aa
                                    </div>
                                    <span className="text-sm truncate max-w-[180px]" title={font}>
                                      {font}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    {currentFont === font && (
                                      <Check className="h-4 w-4 text-primary mr-1" />
                                    )}
                                    <button
                                      className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(font);
                                      }}
                                    >
                                      <Heart 
                                        className={`h-4 w-4 ${
                                          favorites.includes(font) 
                                            ? 'text-red-500 fill-red-500' 
                                            : 'text-neutral-400'
                                        }`} 
                                      />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="browse" className="h-full mt-0 overflow-auto">
                  <FontGallery 
                    currentFont={currentFont || "Roboto"}
                    onFontSelected={handleFontSelected}
                    sampleText="Aa Bb Cc 123"
                    visible={activeFontTab === "browse"}
                  />
                </TabsContent>
                
                <TabsContent value="compare" className="h-full mt-0 overflow-auto">
                  <FontComparison 
                    currentFont={currentFont} 
                    onFontSelected={handleFontSelected}
                  />
                </TabsContent>
                
                <TabsContent value="custom" className="h-full mt-0 overflow-auto">
                  <LocalFontPreviewer 
                    onFontSelected={handleFontSelected}
                    currentFont={currentFont}
                    previewText="Aa Bb Cc 123"
                  />
                </TabsContent>
                
                <TabsContent value="styles" className="h-full mt-0 overflow-auto">
                  {currentFont ? (
                    <FontWeightStylePreview 
                      fontFamily={currentFont}
                      sampleText="The quick brown fox jumps over the lazy dog"
                      onWeightChange={(weight) => {
                        // Apply weight change to selected text in canvas
                        if (onFontSelected && currentFont) {
                          onFontSelected(currentFont, { weight });
                        }
                      }}
                      onStyleChange={(isItalic) => {
                        // Apply style change to selected text in canvas
                        if (onFontSelected && currentFont) {
                          onFontSelected(currentFont, { isItalic });
                        }
                      }}
                      onUnderlineChange={(isUnderlined) => {
                        // Apply underline change to selected text in canvas
                        if (onFontSelected && currentFont) {
                          onFontSelected(currentFont, { isUnderlined });
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <Sliders className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Font Selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Select a text object on the canvas first to adjust its font weight and style.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          {/* Display current selection information */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentFont ? (
                <>Current font: <span className="font-medium">{currentFont}</span></>
              ) : (
                "Select text to apply a font"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
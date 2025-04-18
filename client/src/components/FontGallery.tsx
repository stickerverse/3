import { useState, useEffect, useRef } from "react";
import googleFontsService from "../lib/googleFontsService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SystemFontBrowser from "./SystemFontBrowser";
import FontComparison from "./FontComparison";

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
  const [animatedFonts, setAnimatedFonts] = useState<Record<string, boolean>>({});
  const [animationText, setAnimationText] = useState<string>("Aa");
  const [animationStyles, setAnimationStyles] = useState<Record<string, string>>({});
  const galleryRef = useRef<HTMLDivElement>(null);
  const animationInterval = useRef<NodeJS.Timeout | null>(null);

  // Load all fonts when component mounts
  useEffect(() => {
    const loadFonts = async () => {
      if (!visible) return;

      setIsLoading(true);
      try {
        // First preload a small set of popular fonts for immediate display
        const popularFonts = googleFontsService.popularFonts;
        await googleFontsService.loadFonts(popularFonts);

        // Then fetch all fonts from API
        const data = await googleFontsService.fetchGoogleFonts("all");
        const fontList = data.fonts.map((font: any) => font.family);

        setFonts(fontList);
        setDisplayFonts(fontList.slice(0, 20)); // Initially show fewer fonts for faster loading
        setCategories(data.categories);

        // Preload the initial set of visible fonts more thoroughly
        const initialFonts = fontList.slice(0, 20);
        await googleFontsService.loadFonts(initialFonts);

        // After a delay, load the next batch in the background
        setTimeout(() => {
          googleFontsService.loadFonts(fontList.slice(20, 50));
        }, 1000);

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

    // Create a debounce function to not call the scroll handler too often
    let scrollTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        const container = galleryRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        
        // If scrolled to bottom - 300px (load earlier), load more fonts
        if (scrollHeight - scrollTop <= clientHeight + 300) {
          console.log("Scroll triggered font loading");
          
          // Load next batch of fonts
          const currentLength = displayFonts.length;
          if (currentLength < fonts.length) {
            // Get the appropriate source of fonts based on active category
            const filteredFonts = activeCategory === "all"
              ? fonts
              : categories[activeCategory] || [];

            // Apply search filter if any
            const searchFiltered = searchQuery
              ? filteredFonts.filter(font => font.toLowerCase().includes(searchQuery.toLowerCase()))
              : filteredFonts;

            // Get next batch, increase to 30 fonts per load for smoother experience
            const nextBatch = searchFiltered.slice(currentLength, currentLength + 30);
            if (nextBatch.length > 0) {
              console.log(`Loading ${nextBatch.length} more fonts`);
              
              // Update displayed fonts
              setDisplayFonts(prev => [...prev, ...nextBatch]);
              
              // Preload these fonts for display
              googleFontsService.loadFonts(nextBatch);
            }
          }
        }
      }, 150); // Small debounce to prevent firing too many times
    };

    const containerRef = galleryRef.current;
    containerRef.addEventListener("scroll", handleScroll);
    
    // Initial check to see if we need to load more fonts right away
    // (helpful if the container is large enough that scrolling isn't needed yet)
    handleScroll();

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      containerRef.removeEventListener("scroll", handleScroll);
    };
  }, [displayFonts, fonts, categories, activeCategory, searchQuery, visible]);

  // Handle search and category filter
  useEffect(() => {
    if (!visible) return;

    setIsLoading(true);

    const loadCategoryFonts = async () => {
      // GitHub fonts category was removed

      // Handle system fonts category
      if (activeCategory === "system") {
        try {
          // Load system fonts if needed
          const systemFonts = await googleFontsService.getFontsByCategory('system');

          if (!systemFonts || systemFonts.length === 0) {
            // Try to load system fonts from json file
            await googleFontsService.loadSystemFontsFromJson();
            const refreshedFonts = await googleFontsService.getFontsByCategory('system');
            setDisplayFonts(refreshedFonts || []);
          } else {
            setDisplayFonts(systemFonts);
          }
        } catch (error) {
          console.error("Error loading system fonts:", error);
          setDisplayFonts([]);
        } finally {
          setIsLoading(false);
        }
        return; // Exit early
      }

      // For standard categories (all, sans-serif, serif, etc.)
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
    };

    loadCategoryFonts();
  }, [searchQuery, activeCategory, visible, categories]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  // Determine the animation style for each font category
  useEffect(() => {
    if (!visible) return;

    const fontAnimationStyles: Record<string, string> = {};

    // Assign an animation style to each font based on its category
    Object.entries(categories).forEach(([category, fontList]) => {
      const animation = getAnimationForCategory(category);
      fontList.forEach(font => {
        fontAnimationStyles[font] = animation;
      });
    });

    setAnimationStyles(fontAnimationStyles);
  }, [categories, visible]);

  // Get animation style based on font category
  const getAnimationForCategory = (category: string): string => {
    switch(category) {
      case 'sans-serif': return 'animate-float';
      case 'serif': return 'animate-bounce';
      case 'display': return 'animate-bounce';
      case 'handwriting': return 'animate-float';
      case 'monospace': return 'animate-float';
      default: return 'animate-float';
    }
  };

  // Get different styles for different font categories
  const getPreviewStyle = (font: string): string => {
    if (!font || !categories) return '';

    let category = "sans-serif"; // default
    for (const [cat, fonts] of Object.entries(categories)) {
      if (fonts.includes(font)) {
        category = cat;
        break;
      }
    }

    switch(category) {
      case 'serif': 
        return 'bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent';
      case 'display': 
        return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent';
      case 'handwriting': 
        return 'bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent';
      case 'monospace': 
        return 'bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent';
      default: 
        return '';
    }
  };

  // Animation effect for the hovered font
  useEffect(() => {
    if (hoveredFont) {
      // Start animation for this font
      setAnimatedFonts(prev => ({ ...prev, [hoveredFont]: true }));

      // Set up interval to cycle through different text displays
      if (!animationInterval.current) {
        const sansSerifOptions = ["Aa", "Bb", "Cc", "Dd"];
        const serifOptions = ["Aa", "Serif", "Type", "Text"];
        const displayOptions = ["Wow!", "Look!", "Cool!", "Nice!"];
        const handwritingOptions = ["Hello", "Write", "Script", "Note"];
        const monospaceOptions = ["Code", "0101", "Hack", "</>"];

        // Determine which category the hovered font belongs to
        let category = "sans-serif"; // default
        for (const [cat, fonts] of Object.entries(categories)) {
          if (fonts.includes(hoveredFont)) {
            category = cat;
            break;
          }
        }

        // Choose appropriate text options based on category
        let textOptions: string[];
        switch(category) {
          case 'sans-serif': textOptions = sansSerifOptions; break;
          case 'serif': textOptions = serifOptions; break;
          case 'display': textOptions = displayOptions; break;
          case 'handwriting': textOptions = handwritingOptions; break;
          case 'monospace': textOptions = monospaceOptions; break;
          default: textOptions = sansSerifOptions;
        }

        let index = 0;
        animationInterval.current = setInterval(() => {
          index = (index + 1) % textOptions.length;
          setAnimationText(textOptions[index]);
        }, 1200);
      }
    } else {
      // Stop animation when no font is hovered
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
        setAnimationText("Aa");
      }

      // Reset all animations after a delay
      setTimeout(() => {
        setAnimatedFonts({});
      }, 300);
    }

    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
        animationInterval.current = null;
      }
    };
  }, [hoveredFont, categories]);

  // If component is not visible, don't render anything
  if (!visible) return null;

  return (
    <div className="mt-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Browse your fonts</h3>

        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="w-48">
            <FontComparison 
              currentFont={currentFont}
              onFontSelected={onFontSelected}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md border">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
          Enter text below to preview it with all fonts
        </p>
        <div className="flex items-center space-x-2 mt-3">
          <Input
            placeholder="Type to preview fonts..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-neutral-500">
            {customText ? 'Preview text applied to all fonts' : 'Default "Aa" showing in previews'}
          </div>
          {customText && (
            <button
              onClick={() => setCustomText('')}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear text
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-4">
        <TabsList className="w-full flex-wrap">
          <TabsTrigger value="all" onClick={() => handleCategoryChange("all")}>
            All Fonts
          </TabsTrigger>
          {/* GitHub Fonts tab removed */}
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
          <TabsTrigger value="system" onClick={() => handleCategoryChange("system")}>
            System Fonts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeCategory === "system" ? (
        <div className="h-[480px] overflow-y-auto border rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <SystemFontBrowser onFontSelected={onFontSelected} />
        </div>
      ) : (
        <div 
          ref={galleryRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 h-[480px] overflow-y-auto p-5 border rounded-lg bg-neutral-50 dark:bg-neutral-900"
        >
          {isLoading && displayFonts.length === 0 ? (
            <div className="col-span-full h-full flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : displayFonts.length > 0 ? (
            displayFonts.map((font, index) => (
            <button
              key={`font-${activeCategory}-${font}-${index}`}
              className={`
                bg-white dark:bg-neutral-800 cursor-pointer transition-all w-full block overflow-hidden
                ${font === currentFont ? 
                  'shadow-[0_0_0_2px] shadow-primary' : 
                  'border border-neutral-200 dark:border-neutral-700 hover:border-primary/50'}
                hover:scale-105 rounded-2xl flex flex-col shadow-lg hover:shadow-xl transform transition-all duration-200
              `}
              onClick={() => onFontSelected(font)}
              onMouseEnter={() => setHoveredFont(font)}
              onMouseLeave={() => setHoveredFont(null)}
            >
              <div 
                className={`
                  p-4 flex items-center justify-center ${customText && customText.length > 20 ? 'h-44' : 'h-36'} 
                  bg-white dark:bg-neutral-800 rounded-t-2xl transition-all duration-200
                  ${font === currentFont ? 'bg-primary/5 dark:bg-primary/10' : ''}
                  overflow-hidden
                `} 
              >
                <div className={`
                  ${!customText ? 'text-5xl' : 
                    customText.length < 5 ? 'text-5xl' : 
                    customText.length < 10 ? 'text-4xl' : 
                    customText.length < 20 ? 'text-3xl' : 'text-xl'} 
                  text-center relative w-full py-2
                  ${hoveredFont === font ? 'text-primary scale-110 transition-all duration-200' : ''}
                  ${font === currentFont ? 'text-primary font-bold' : ''}
                  flex justify-center items-center h-full
                `}>
                  <span 
                    style={{ 
                      fontFamily: googleFontsService.isFontLoaded(font)
                        ? `"${font}", sans-serif` 
                        : 'system-ui, sans-serif'
                    }}
                    className={`
                      inline-block transition-all duration-300
                      ${hoveredFont === font ? animationStyles[font] || 'animate-float' : ''}
                      ${hoveredFont === font ? getPreviewStyle(font) : ''}
                      ${hoveredFont !== font && font === currentFont ? 'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent ring-2 ring-primary/20 rounded-md px-2 py-1' : ''}
                      ${customText ? 'px-1' : ''}
                      ${!hoveredFont && customText ? 'py-2 px-3 bg-white/10 dark:bg-black/10 rounded-md' : ''}
                      ${!googleFontsService.isFontLoaded(font) ? 'opacity-70' : ''}
                    `}
                  >
                    {hoveredFont === font 
                      ? animationText 
                      : customText 
                        ? (customText.length > 30 ? customText.substring(0, 30) + "..." : customText) 
                        : "Aa"}
                  </span>
                  {hoveredFont === font && (
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs text-primary mt-1 whitespace-nowrap animate-pulse">
                      Click to select
                    </span>
                  )}
                </div>
              </div>
              <div className={`
                text-center p-2 border-t border-neutral-100 dark:border-neutral-700 truncate text-xs
                font-sans rounded-b-2xl
                ${font === currentFont ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium' : 'bg-neutral-50 dark:bg-neutral-900'}
              `}>
                {font}
              </div>
            </button>
          ))
        ) : null}
        </div>
      )}
    </div>
  );
}
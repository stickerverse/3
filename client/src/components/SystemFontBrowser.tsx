import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; 
import googleFontsService from '../lib/googleFontsService';
import { FilePlus } from 'lucide-react';

interface SystemFontBrowserProps {
  onClose?: () => void;
  onFontSelected?: (fontName: string) => void;
  currentFont?: string;
}

export default function SystemFontBrowser({ onClose, onFontSelected, currentFont }: SystemFontBrowserProps) {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [previewText, setPreviewText] = useState('Aa Bb Cc');
  const [loadComplete, setLoadComplete] = useState(false);
  const [missingFontsFolder, setMissingFontsFolder] = useState(false);
  const [fontsPerPage] = useState(50); // Number of fonts to display per page
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  

  // Load fonts from the system (local fonts.json file)
  useEffect(() => {
    async function loadSystemFonts() {
      setIsLoading(true);
      try {
        // First check if system fonts are loaded
        const systemFonts = await googleFontsService.getFontsByCategory('system');

        if (systemFonts && systemFonts.length > 0) {
          setLoadedFonts(systemFonts);
          setLoadComplete(true);
        } else {
          // Trigger a font scan on the server if no fonts are found
          try {
            const response = await fetch('/api/fonts/scan', { method: 'POST' });
            if (response.ok) {
              console.log('Font scan triggered successfully');
              // Wait a moment for the scan to complete
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.error('Error triggering font scan:', error);
          }

          // Try to reload system fonts (force refresh from file)
          await googleFontsService.loadSystemFontsFromJson();
          const refreshedFonts = await googleFontsService.getFontsByCategory('system');

          if (refreshedFonts && refreshedFonts.length > 0) {
            setLoadedFonts(refreshedFonts);
            setLoadComplete(true);
          } else {
            setMissingFontsFolder(true);
          }
        }
      } catch (error) {
        console.error('Error loading system fonts:', error);
        setMissingFontsFolder(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadSystemFonts();
  }, []);

  // Filter fonts by name
  const filteredFonts = filterText
    ? loadedFonts.filter(font => 
        font.toLowerCase().includes(filterText.toLowerCase())
      )
    : loadedFonts;

  // Pagination
  const startIndex = (currentPage - 1) * fontsPerPage;
  const endIndex = startIndex + fontsPerPage;
  const fontsToDisplay = filteredFonts.slice(startIndex, endIndex);


  const handleLoadMore = () => {
    setCurrentPage(currentPage + 1);
  };
  
  // Handle scroll to load more fonts
  useEffect(() => {
    if (!containerRef.current || missingFontsFolder || isLoading) return;
    
    // Create a debounce function for scroll events
    let scrollTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        
        const { scrollTop, scrollHeight, clientHeight } = container;
        
        // If scrolled to bottom - 100px, load more fonts
        if (scrollHeight - scrollTop <= clientHeight + 100) {
          console.log("Scroll triggered font loading");
          
          // Check if we have more fonts to load
          if (endIndex < filteredFonts.length) {
            setCurrentPage(prevPage => prevPage + 1);
          }
        }
      }, 150); // Small debounce for performance
    };
    
    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    
    // Initial check - in case the container isn't scrollable yet
    setTimeout(handleScroll, 500);
    
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      container.removeEventListener('scroll', handleScroll);
    };
  }, [endIndex, filteredFonts.length, isLoading, missingFontsFolder]);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : missingFontsFolder ? (
        <div className="p-4 text-center border border-dashed border-muted-foreground/20 rounded-lg">
          <h3 className="font-medium mb-2">No system fonts found</h3>
          <p className="text-sm text-muted-foreground mb-2">
            To use system fonts, follow these steps:
          </p>
          <ol className="text-sm text-left max-w-md mx-auto space-y-1 mb-2">
            <li>1. Place .ttf, .otf, .woff, or .woff2 font files in the <code>fonts/</code> folder</li>
            <li>2. Run <code>node scripts/scan-fonts.js</code> to generate metadata</li>
            <li>3. Reload this page to view your fonts</li>
          </ol>
          <Badge variant="outline" className="mt-2">More fonts = more creativity</Badge>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex gap-2">
            <Input
              placeholder="Search system fonts..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-1/2"
            />
            <Input 
              placeholder="Type to preview..."
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-1/2"
            />
          </div>

          <div className="relative">
            {loadedFonts.length > 24 && fontsToDisplay.length <= 24 && (
              <div className="absolute bottom-0 left-0 w-full h-12 z-10 pointer-events-none flex justify-center items-center">
                <div className="bg-white/80 dark:bg-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full shadow-sm flex items-center animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Scroll to see more fonts
                </div>
              </div>
            )}
            
            <div 
              ref={containerRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1 rounded-lg"
            >
              {fontsToDisplay.length === 0 ? (
                <div className="col-span-full text-center p-4 text-muted-foreground">
                  No fonts match your search
                </div>
              ) : (
                fontsToDisplay.map((fontName, index) => (
                  <div 
                    key={`system-browser-font-${index}-${fontName}`}
                    className={`bg-white dark:bg-neutral-800 border ${currentFont === fontName ? 'border-primary border-2' : 'border-neutral-200 dark:border-neutral-700'} rounded-xl overflow-hidden shadow hover:shadow-md hover:border-primary/50 hover:scale-105 transition-all duration-200 cursor-pointer`}
                    onClick={() => onFontSelected && onFontSelected(fontName)}
                  >
                    <div
                      className="flex items-center justify-center h-20 p-2 bg-white dark:bg-neutral-800 overflow-hidden relative"
                      style={{ fontFamily: fontName }}
                    >
                      <span className="text-2xl relative z-10">
                        {previewText || "Aa"}
                      </span>
                      <div className="absolute bottom-0 right-0 bg-gradient-to-l from-emerald-50/30 dark:from-emerald-900/20 to-transparent w-full h-1/2 opacity-60 pointer-events-none"></div>
                    </div>
                    <div className={`relative text-xs text-center p-1 border-t border-neutral-100 dark:border-neutral-700 truncate font-medium ${currentFont === fontName ? 'bg-primary/10 text-primary' : 'bg-neutral-50 dark:bg-neutral-900'}`}>
                      <div className="flex justify-center items-center">
                        <span className="truncate">{fontName}</span>
                        <span className="ml-1 text-[7px] text-emerald-600 dark:text-emerald-400 opacity-70">local</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Show loading indicator at the bottom while more fonts are available */}
              {filteredFonts.length > fontsToDisplay.length && (
                <div className="col-span-full flex justify-center py-2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {loadComplete && (
              <div className="text-xs text-muted-foreground text-center mt-2 flex justify-center items-center gap-1">
                <span>Showing {fontsToDisplay.length} of {filteredFonts.length} fonts from your</span> 
                <span className="px-1 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-[9px]">/fonts</span>
                <span>folder</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
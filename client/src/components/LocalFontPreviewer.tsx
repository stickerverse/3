import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import googleFontsService from '../lib/googleFontsService';
import { Button } from '@/components/ui/button';

interface LocalFontPreviewerProps {
  onFontSelected?: (fontFamily: string) => void;
  currentFont?: string;
  previewText?: string;
}

export default function LocalFontPreviewer({
  onFontSelected,
  currentFont,
  previewText = "Aa Bb Cc"
}: LocalFontPreviewerProps) {
  const [localFonts, setLocalFonts] = useState<string[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [displayedFonts, setDisplayedFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [previewSize, setPreviewSize] = useState<'small' | 'large'>('small');
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const [showPopularFirst, setShowPopularFirst] = useState(true);
  
  // Function to load initial batch of fonts
  const loadInitialFonts = useCallback(() => {
    const initialBatchSize = 24;
    if (filteredFonts.length > 0) {
      setDisplayedFonts(filteredFonts.slice(0, initialBatchSize));
    }
  }, [filteredFonts]);
  
  // Function to load more fonts on scroll
  const loadMoreFonts = useCallback(() => {
    const batchSize = 16;
    const currentLength = displayedFonts.length;
    
    if (currentLength < filteredFonts.length) {
      const newBatch = filteredFonts.slice(
        currentLength, 
        Math.min(currentLength + batchSize, filteredFonts.length)
      );
      setDisplayedFonts(prev => [...prev, ...newBatch]);
    }
  }, [displayedFonts, filteredFonts]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loadingRef.current && !observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreFonts();
          }
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loadMoreFonts]);
  
  // Load local fonts on component mount
  useEffect(() => {
    async function loadLocalFonts() {
      setIsLoading(true);
      try {
        // Explicitly run the font scan to ensure fonts are loaded
        try {
          const scanResponse = await fetch('/api/scan-fonts', { method: 'POST' });
          if (!scanResponse.ok) {
            console.warn('Font scan request failed, will try to use existing data');
          }
        } catch (scanError) {
          console.warn('Font scan endpoint not available, will try to use existing data');
        }
        
        // Load system fonts - this also loads the fonts.json file
        await googleFontsService.loadSystemFontsFromJson();
        
        // Get the fonts - make sure we're using a synchronous method here, not a Promise
        const systemFonts = googleFontsService.categories['system'] || [];
        console.log('Loading system fonts from fonts.json...');
        
        if (systemFonts && systemFonts.length > 0) {
          console.log(`Found ${systemFonts.length} fonts in the system category`);
          
          // Sort fonts alphabetically as default
          const sortedFonts = [...systemFonts].sort((a, b) => a.localeCompare(b));
          
          setLocalFonts(sortedFonts);
          setFilteredFonts(sortedFonts);
        } else {
          console.log('No local fonts found in the system category');
          
          // Try to directly read from fonts.json as a fallback
          try {
            const response = await fetch('/fonts.json');
            if (response.ok) {
              const fontPaths = await response.json();
              if (Array.isArray(fontPaths) && fontPaths.length > 0) {
                // Extract font names from paths
                const fontNames = fontPaths.map(path => {
                  const fileName = path.split('/').pop() || '';
                  return fileName.split('.')[0]
                    .replace(/([_-])/g, ' ')
                    .replace(/([A-Z])/g, ' $1')
                    .trim();
                });
                console.log(`Extracted ${fontNames.length} font names from fonts.json`);
                
                // Sort alphabetically
                const sortedFonts = [...fontNames].sort((a, b) => a.localeCompare(b));
                
                setLocalFonts(sortedFonts);
                setFilteredFonts(sortedFonts);
              }
            }
          } catch (jsonError) {
            console.error('Error parsing fonts.json directly:', jsonError);
          }
        }
      } catch (error) {
        console.error('Error loading local fonts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLocalFonts();
  }, []);
  
  // Load initial batch of fonts after filteredFonts are set
  useEffect(() => {
    loadInitialFonts();
  }, [filteredFonts, loadInitialFonts]);
  
  // Filter fonts when search input changes
  useEffect(() => {
    if (!searchInput.trim()) {
      setFilteredFonts(localFonts);
      return;
    }
    
    const filtered = localFonts.filter(font => 
      font.toLowerCase().includes(searchInput.toLowerCase())
    );
    setFilteredFonts(filtered);
    // Reset displayed fonts when search changes
    setDisplayedFonts([]);
  }, [searchInput, localFonts]);
  
  // Re-trigger initial font loading when filtered fonts change
  useEffect(() => {
    loadInitialFonts();
  }, [filteredFonts, loadInitialFonts]);
  
  // Function to toggle sorting order (alphabetical or by popularity)
  const toggleSorting = () => {
    setShowPopularFirst(!showPopularFirst);
    
    if (showPopularFirst) {
      // Switch to alphabetical sorting
      const sortedFonts = [...localFonts].sort((a, b) => a.localeCompare(b));
      setFilteredFonts(sortedFonts);
    } else {
      // For now we don't have real popularity data, so just use a simplified approach
      // In a real app, you might have actual popularity metrics
      const popularFirst = [...localFonts].sort((a, b) => {
        // Put some fonts with common names at the top
        const popularTerms = ['sans', 'serif', 'mono', 'bold', 'regular', 'medium'];
        const aHasPopularTerm = popularTerms.some(term => a.toLowerCase().includes(term));
        const bHasPopularTerm = popularTerms.some(term => b.toLowerCase().includes(term));
        
        if (aHasPopularTerm && !bHasPopularTerm) return -1;
        if (!aHasPopularTerm && bHasPopularTerm) return 1;
        return a.localeCompare(b);
      });
      
      setFilteredFonts(popularFirst);
    }
    
    // Reset displayed fonts
    setDisplayedFonts([]);
  };
  
  // Toggle preview size
  const togglePreviewSize = () => {
    setPreviewSize(prev => prev === 'small' ? 'large' : 'small');
  };
  
  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap gap-2">
        <Input
          placeholder="Search local fonts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleSorting}
            className="text-xs"
            title={showPopularFirst ? "Currently showing popular fonts first" : "Currently sorting alphabetically"}
          >
            {showPopularFirst ? "A-Z" : "Popular"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={togglePreviewSize}
            className="text-xs"
            title={previewSize === 'small' ? "Switch to larger previews" : "Switch to smaller previews"}
          >
            {previewSize === 'small' ? "Larger" : "Smaller"}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : filteredFonts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No fonts found matching your search
        </div>
      ) : (
        <div>
          <div 
            ref={containerRef}
            className={`grid ${previewSize === 'small' 
              ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            } gap-3 max-h-[320px] overflow-y-auto p-1 rounded-md`}
          >
            {displayedFonts.map((fontName, index) => (
              <div
                key={`local-font-${index}-${fontName}`}
                className={`
                  bg-white dark:bg-neutral-800 border rounded-lg overflow-hidden
                  ${currentFont === fontName ? 'border-primary border-2' : 'border-neutral-200 dark:border-neutral-700'}
                  transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer
                `}
                onClick={() => onFontSelected && onFontSelected(fontName)}
              >
                <div
                  className={`flex items-center justify-center ${previewSize === 'small' ? 'h-16' : 'h-24'} p-2 relative`}
                  style={{ fontFamily: fontName }}
                >
                  <span className={`${previewSize === 'small' ? 'text-xl' : 'text-2xl'} relative z-10`}>
                    {previewText}
                  </span>
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-50/30 dark:from-emerald-900/20 to-transparent opacity-60 pointer-events-none"></div>
                </div>
                <div className={`
                  text-xs p-1 border-t border-neutral-100 dark:border-neutral-700 truncate font-medium
                  ${currentFont === fontName ? 'bg-primary/10 text-primary' : 'bg-neutral-50 dark:bg-neutral-900'}
                `}>
                  <div className="flex justify-between items-center">
                    <span className="truncate">{fontName}</span>
                    <span className="text-[7px] text-emerald-600 dark:text-emerald-400">local</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator at the bottom that serves as intersection observer target */}
            {displayedFonts.length < filteredFonts.length && (
              <div 
                ref={loadingRef} 
                className="col-span-full flex justify-center py-2"
              >
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Showing {displayedFonts.length} of {filteredFonts.length} local fonts from your <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[9px]">/fonts</code> folder
            {displayedFonts.length < filteredFonts.length && 
              <span className="ml-1 opacity-70">(scroll to load more)</span>
            }
          </div>
        </div>
      )}
    </div>
  );
}
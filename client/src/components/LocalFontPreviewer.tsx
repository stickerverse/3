import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import googleFontsService from '../lib/googleFontsService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load local fonts on component mount
  useEffect(() => {
    async function loadLocalFonts() {
      setIsLoading(true);
      try {
        // Ensure system fonts are loaded
        await googleFontsService.loadSystemFontsFromJson();
        const systemFonts = await googleFontsService.getFontsByCategory('system');
        
        if (systemFonts && systemFonts.length > 0) {
          setLocalFonts(systemFonts);
          setFilteredFonts(systemFonts);
        } else {
          console.log('No local fonts found');
        }
      } catch (error) {
        console.error('Error loading local fonts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadLocalFonts();
  }, []);
  
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
  }, [searchInput, localFonts]);
  
  return (
    <div className="w-full">
      <div className="mb-3">
        <Input
          placeholder="Search local fonts..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full"
        />
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1"
          >
            {filteredFonts.map((fontName, index) => (
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
                  className="flex items-center justify-center h-16 p-2 relative"
                  style={{ fontFamily: fontName }}
                >
                  <span className="text-xl relative z-10">
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
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Showing {filteredFonts.length} local fonts from your <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[9px]">/fonts</code> folder
          </div>
        </div>
      )}
    </div>
  );
}
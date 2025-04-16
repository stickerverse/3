import React, { useState, useEffect } from 'react';
import { Search, X, Upload, ChevronDown, MoreVertical } from 'lucide-react';
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import googleFontsService from '@/lib/googleFontsService';

interface FontPreviewGridProps {
  onFontSelected: (fontFamily: string) => void;
  currentFont?: string;
  previewText?: string;
}

export default function FontPreviewGrid({ 
  onFontSelected, 
  currentFont,
  previewText = "Aa" 
}: FontPreviewGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [fonts, setFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Load fonts on component mount
  useEffect(() => {
    async function loadFonts() {
      setIsLoading(true);
      
      try {
        // First load system fonts (local)
        await googleFontsService.ensureSystemFontsLoaded();
        const systemFonts = googleFontsService.getSystemFonts();
        
        // Set the fonts state
        setFonts(systemFonts);
      } catch (error) {
        console.error('Error loading fonts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadFonts();
  }, []);
  
  // Filter fonts based on search query
  const filteredFonts = fonts.filter(font => 
    font.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handler for font selection
  const handleFontSelect = (font: string) => {
    onFontSelected(font);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Your Fonts <span className="text-xs text-neutral-500">{fonts.length} Total</span></h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Upload className="h-3.5 w-3.5" />
              <span className="text-xs">Upload</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs">Browse</Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search fonts..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <span className="text-xs">All Categories</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Separator className="my-4" />

        <div>
          <h3 className="text-base font-medium mb-3">Browse your fonts</h3>
          <p className="text-sm text-neutral-500 mb-4">
            Below you'll find an overview of all the fonts you have in your collection. Click on a font to apply it.
          </p>
        </div>

        <div>
          <h3 className="text-base font-medium mb-3">Preview fonts with your own text...</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
              {Array(10).fill(0).map((_, index) => (
                <Card key={index} className="h-44 animate-pulse">
                  <CardContent className="p-6 flex items-center justify-center">
                    <div className="w-full h-6 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
              {filteredFonts.slice(0, 20).map((font, index) => (
                <Card 
                  key={index} 
                  className={`group cursor-pointer hover:shadow-md transition ${
                    currentFont === font ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleFontSelect(font)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center h-44">
                    <div 
                      className="text-4xl mb-4 flex items-center justify-center h-20 w-full"
                      style={{ fontFamily: font }}
                    >
                      {previewText}
                    </div>
                    <div className="mt-auto w-full flex justify-between items-center">
                      <div 
                        className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[80%]"
                        title={font}
                      >
                        {font}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {filteredFonts.length > 20 && (
            <div className="flex justify-center mt-6">
              <Button variant="outline">Load More Fonts</Button>
            </div>
          )}
          
          {filteredFonts.length === 0 && !isLoading && (
            <div className="text-center py-12 text-neutral-500">
              <p>No fonts found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
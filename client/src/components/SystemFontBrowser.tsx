import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; 
import googleFontsService from '../lib/googleFontsService';
import { FilePlus } from 'lucide-react';

interface SystemFontBrowserProps {
  onClose?: () => void;
  onFontSelected?: (fontName: string) => void;
}

export default function SystemFontBrowser({ onClose, onFontSelected }: SystemFontBrowserProps) {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [previewText, setPreviewText] = useState('Aa Bb Cc');
  const [loadComplete, setLoadComplete] = useState(false);
  const [missingFontsFolder, setMissingFontsFolder] = useState(false);

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

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilePlus className="h-5 w-5" />
          System Fonts
        </CardTitle>
        <CardDescription>
          Browse and select fonts from your local system
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : missingFontsFolder ? (
          <div className="p-6 text-center border border-dashed border-muted-foreground/20 rounded-lg">
            <h3 className="font-medium mb-2">No system fonts found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To use system fonts, follow these steps:
            </p>
            <ol className="text-sm text-left max-w-md mx-auto space-y-2 mb-4">
              <li>1. Place .ttf, .otf, .woff, or .woff2 font files in the <code>fonts/</code> folder</li>
              <li>2. Run <code>node scripts/scan-fonts.js</code> to generate metadata</li>
              <li>3. Reload this page to view your fonts</li>
            </ol>
            <Badge variant="outline" className="mt-2">More fonts = more creativity</Badge>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Input
                placeholder="Search system fonts..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="mb-4"
              />
              <Input 
                placeholder="Type to preview fonts..."
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
              {filteredFonts.length === 0 ? (
                <div className="col-span-full text-center p-8 text-muted-foreground">
                  No fonts match your search
                </div>
              ) : (
                filteredFonts.map((fontName, index) => (
                  <div 
                    key={`system-browser-font-${index}-${fontName}`}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-primary/50 hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => onFontSelected && onFontSelected(fontName)}
                  >
                    <div
                      className="flex items-center justify-center h-36 p-4 bg-white dark:bg-neutral-800 overflow-hidden"
                      style={{ fontFamily: fontName }}
                    >
                      <span className="text-5xl">
                        {previewText || "Aa"}
                      </span>
                    </div>
                    <div className="text-sm text-center p-2 border-t border-neutral-100 dark:border-neutral-700 truncate font-medium bg-neutral-50 dark:bg-neutral-900">
                      {fontName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        {loadComplete && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredFonts.length} of {loadedFonts.length} system fonts
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
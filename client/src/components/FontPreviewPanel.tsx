import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  fontCategories
}: FontPreviewPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);

  // Get all fonts from all categories
  const allFonts = Object.values(fontCategories).flat();

  // Filter fonts based on search and category
  useEffect(() => {
    let fonts = selectedCategory === "all" 
      ? allFonts 
      : fontCategories[selectedCategory] || [];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fonts = fonts.filter(font => font.toLowerCase().includes(query));
    }
    
    setFilteredFonts(fonts);
  }, [searchQuery, selectedCategory, fontCategories]);

  // Handle font selection
  const handleSelectFont = (font: string) => {
    setFont(font);
    // Optional: close panel on selection
    // setShowFontPreview(false);
  };

  return (
    <Dialog open={showFontPreview} onOpenChange={setShowFontPreview}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Font Preview Gallery</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
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
        
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <TabsList className="flex flex-wrap justify-start mb-2">
            <TabsTrigger value="all">All Fonts</TabsTrigger>
            {Object.keys(fontCategories).map(category => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <ScrollArea className="flex-1 border rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFonts.map(font => (
                <div 
                  key={font}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    currentFont === font ? 'border-primary border-2' : 'border-neutral-200 dark:border-neutral-700'
                  }`}
                  onClick={() => handleSelectFont(font)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                      {font}
                    </span>
                    {currentFont === font && (
                      <Badge variant="default" className="ml-2">Selected</Badge>
                    )}
                  </div>
                  <div 
                    className="h-14 flex items-center justify-center overflow-hidden"
                    style={{ fontFamily: font }}
                  >
                    <span className="text-2xl truncate">
                      {previewText || "Your Text Here"}
                    </span>
                  </div>
                </div>
              ))}
              
              {filteredFonts.length === 0 && (
                <div className="col-span-full text-center p-8 text-neutral-500">
                  No fonts match your search criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setShowFontPreview(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
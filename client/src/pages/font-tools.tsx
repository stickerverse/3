import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import FontSettingsPanel from "../components/FontSettingsPanel";
import googleFontsService from "../lib/googleFontsService";

export default function FontToolsPage() {
  const [currentFontSet, setCurrentFontSet] = useState<string>("all");
  const [loadedFonts, setLoadedFonts] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [fonts, setFonts] = useState<any[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadFonts(currentFontSet);
  }, [currentFontSet]);
  
  useEffect(() => {
    // Filter fonts based on search query
    if (searchQuery.trim() === "") {
      setFilteredFonts(fonts.slice(0, 100)); // Only show first 100 for performance
    } else {
      const filtered = fonts.filter(font => 
        font.family.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFonts(filtered.slice(0, 100));
    }
  }, [searchQuery, fonts]);
  
  async function loadFonts(fontSet: string) {
    setIsLoading(true);
    try {
      // Re-initialize the font service with the selected font set
      await googleFontsService.init(fontSet);
      
      // Get the loaded font data
      const data = await googleFontsService.fetchGoogleFonts(fontSet);
      setFonts(data.fonts);
      setFilteredFonts(data.fonts.slice(0, 100));
      setCategories(data.categories);
      setLoadedFonts(data.total);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading fonts:", error);
      setIsLoading(false);
    }
  }
  
  const handleFontSetSelected = (fontSet: string) => {
    setCurrentFontSet(fontSet);
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Font Management</h1>
        <FontSettingsPanel 
          onFontSetSelected={handleFontSetSelected} 
          currentFontSet={currentFontSet} 
        />
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Font Library Status</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Loading fonts..." 
              : `${loadedFonts} fonts available in the current set`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Current Font Set:</div>
              <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
                {currentFontSet === "all" ? "All Fonts" : 
                 currentFontSet === "popular" ? "Popular Fonts" :
                 currentFontSet === "display" ? "Display Fonts" :
                 currentFontSet === "handwriting" ? "Handwriting Fonts" :
                 currentFontSet === "monospace" ? "Monospace Fonts" : 
                 currentFontSet}
              </div>
            </div>
            
            <Input
              placeholder="Search fonts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Fonts</TabsTrigger>
          <TabsTrigger value="serif">Serif</TabsTrigger>
          <TabsTrigger value="sans-serif">Sans Serif</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="handwriting">Handwriting</TabsTrigger>
          <TabsTrigger value="monospace">Monospace</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <div className="col-span-3 py-10 text-center">Loading fonts...</div>
            ) : filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <FontPreviewCard key={font.family} font={font} />
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">No fonts found matching your search criteria.</div>
            )}
          </div>
        </TabsContent>
        
        {Object.keys(categories).map(category => (
          <TabsContent key={category} value={category} className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-3 py-10 text-center">Loading fonts...</div>
              ) : (
                filteredFonts
                  .filter(font => font.category === category)
                  .map((font) => (
                    <FontPreviewCard key={font.family} font={font} />
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function FontPreviewCard({ font }: { font: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{font.family}</CardTitle>
        <CardDescription className="text-xs capitalize">
          {font.category} • {font.variants.length} variants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="text-2xl h-16 overflow-hidden" 
          style={{ fontFamily: font.family }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
        <div 
          className="text-sm mt-2 overflow-hidden" 
          style={{ fontFamily: font.family }}
        >
          ABCDEFGHIJKLMNOPQRSTUVWXYZ
          <br />
          abcdefghijklmnopqrstuvwxyz
          <br />
          0123456789.,!?@#$%^&*()
        </div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline" className="w-full">
          Select Font
        </Button>
      </CardFooter>
    </Card>
  );
}
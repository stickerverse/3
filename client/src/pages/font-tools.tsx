import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import FontSelector from "@/components/ui/font-selector";
import FontToolbar from "@/components/ui/font-toolbar";
import googleFontsService from "@/lib/googleFontsService";

export default function FontTools() {
  // For font selector demo
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [fontSize, setFontSize] = useState(24);
  
  // For font toolbar demo
  const [textStyles, setTextStyles] = useState({
    font: "Open Sans",
    size: 16,
    isBold: false,
    isItalic: false,
    isUnderline: false,
    alignment: "left"
  });
  
  // For text preview
  const [customText, setCustomText] = useState("Try typing here to see your text with the selected font styles!");
  
  // For popular fonts
  const [popularFonts, setPopularFonts] = useState<string[]>([]);
  const [isLoadingFonts, setIsLoadingFonts] = useState(true);
  
  // Load popular fonts when component mounts
  useEffect(() => {
    const loadFonts = async () => {
      try {
        setIsLoadingFonts(true);
        // Initialize the font service
        await googleFontsService.init();
        
        // Get popular fonts
        const fonts = await googleFontsService.getFontSamples(10);
        setPopularFonts(fonts);
        
        setIsLoadingFonts(false);
      } catch (error) {
        console.error("Error loading fonts:", error);
        setIsLoadingFonts(false);
      }
    };
    
    loadFonts();
  }, []);
  
  // Handle font selection
  const handleFontSelected = (font: string) => {
    setSelectedFont(font);
    console.log(`Selected font: ${font}`);
  };
  
  // Handle font change in toolbar
  const handleToolbarFontChange = (font: string) => {
    setTextStyles({...textStyles, font});
  };
  
  // Handle font size change in toolbar
  const handleToolbarFontSizeChange = (size: number) => {
    setTextStyles({...textStyles, size});
  };
  
  // Handle text style changes
  const handleBoldChange = (isBold: boolean) => {
    setTextStyles({...textStyles, isBold});
  };
  
  const handleItalicChange = (isItalic: boolean) => {
    setTextStyles({...textStyles, isItalic});
  };
  
  const handleUnderlineChange = (isUnderline: boolean) => {
    setTextStyles({...textStyles, isUnderline});
  };
  
  const handleAlignmentChange = (alignment: string) => {
    setTextStyles({...textStyles, alignment});
  };
  
  // Create text style object for the preview
  const getTextStyle = () => {
    return {
      fontFamily: textStyles.font,
      fontSize: `${textStyles.size}px`,
      fontWeight: textStyles.isBold ? "bold" : "normal",
      fontStyle: textStyles.isItalic ? "italic" : "normal",
      textDecoration: textStyles.isUnderline ? "underline" : "none",
      textAlign: textStyles.alignment as any
    };
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Font Tools</h1>
      
      <Tabs defaultValue="selector">
        <TabsList className="mb-4">
          <TabsTrigger value="selector">Font Selector</TabsTrigger>
          <TabsTrigger value="toolbar">Font Toolbar</TabsTrigger>
          <TabsTrigger value="gallery">Font Gallery</TabsTrigger>
        </TabsList>
        
        {/* Font Selector Demo */}
        <TabsContent value="selector">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Font Selector Component</CardTitle>
                <CardDescription>Click to open the font selector</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="current-font" className="mb-2 block">Current Font</Label>
                  <div id="current-font" className="p-3 rounded-md border text-lg font-medium">
                    {selectedFont}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Label>Select a Font</Label>
                  <FontSelector 
                    value={selectedFont}
                    onFontSelect={handleFontSelected}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Font Preview</CardTitle>
                <CardDescription>See how your selected font looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="p-6 rounded-md border min-h-[200px] flex items-center justify-center text-center"
                  style={{ fontFamily: selectedFont }}
                >
                  <p style={{ fontSize: `${fontSize}px` }}>{previewText}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider 
                    value={[fontSize]} 
                    min={12} 
                    max={72} 
                    step={1} 
                    onValueChange={(value) => setFontSize(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sample-text">Sample Text</Label>
                  <Textarea 
                    id="sample-text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Font Toolbar Demo */}
        <TabsContent value="toolbar">
          <Card>
            <CardHeader>
              <CardTitle>Font Toolbar Component</CardTitle>
              <CardDescription>Complete text formatting toolbar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FontToolbar 
                currentFont={textStyles.font}
                onFontChange={handleToolbarFontChange}
                initialFontSize={textStyles.size}
                onFontSizeChange={handleToolbarFontSizeChange}
                onBoldChange={handleBoldChange}
                onItalicChange={handleItalicChange}
                onUnderlineChange={handleUnderlineChange}
                onAlignmentChange={handleAlignmentChange}
              />
              
              <Separator />
              
              <div>
                <Label className="mb-2 block">Type your text:</Label>
                <Textarea 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full mb-4"
                  rows={3}
                  placeholder="Enter your text here..."
                />
                
                <div 
                  className="p-6 rounded-md border min-h-[200px]"
                  style={getTextStyle()}
                >
                  {customText}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Font Gallery */}
        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <CardTitle>Font Gallery</CardTitle>
              <CardDescription>Browse through a selection of fonts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input 
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Type to preview fonts..."
                  className="mb-4"
                />
              </div>
              
              {isLoadingFonts ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {popularFonts.map((font) => (
                    <div key={font} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{font}</h3>
                        <button 
                          className="text-sm text-primary hover:underline"
                          onClick={() => handleFontSelected(font)}
                        >
                          Select
                        </button>
                      </div>
                      <p 
                        style={{ fontFamily: font, fontSize: "18px" }}
                        className="p-2"
                      >
                        {previewText || "The quick brown fox jumps over the lazy dog"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
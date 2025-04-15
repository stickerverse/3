import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FontSelector from "@/components/FontSelector";

export default function FontSelectorDemo() {
  const [selectedFont, setSelectedFont] = useState("Roboto");
  const [sampleText, setSampleText] = useState("The quick brown fox jumps over the lazy dog");
  const [fontSize, setFontSize] = useState(24);
  
  const handleFontSelected = (font: string) => {
    setSelectedFont(font);
    console.log(`Selected font: ${font}`);
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Font Selector Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Font Selector Component</CardTitle>
            <CardDescription>Click the button below to open the font selector</CardDescription>
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
                onFontSelected={handleFontSelected}
                initialFont={selectedFont}
                buttonText="Choose Font"
              />
            </div>
            
            <div className="flex flex-col space-y-2 mt-4">
              <Label>Font Variant (Outline Button)</Label>
              <FontSelector 
                onFontSelected={handleFontSelected}
                initialFont={selectedFont}
                buttonText="Select Font"
                buttonVariant="outline"
              />
            </div>
            
            <div className="flex flex-col space-y-2 mt-4">
              <Label>Font Variant (Small Button)</Label>
              <FontSelector 
                onFontSelected={handleFontSelected}
                initialFont={selectedFont}
                buttonText="Select Font"
                buttonSize="sm"
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
              <p style={{ fontSize: `${fontSize}px` }}>{sampleText}</p>
            </div>
            
            <div className="space-y-2">
              <Label>Font Size: {fontSize}px</Label>
              <input 
                type="range" 
                min="12" 
                max="72" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sample-text">Sample Text</Label>
              <textarea 
                id="sample-text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Font Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border rounded">
                  <p style={{ fontFamily: "'Roboto', sans-serif" }}>Sans-serif</p>
                </div>
                <div className="p-2 border rounded">
                  <p style={{ fontFamily: "'Playfair Display', serif" }}>Serif</p>
                </div>
                <div className="p-2 border rounded">
                  <p style={{ fontFamily: "'Roboto Mono', monospace" }}>Monospace</p>
                </div>
                <div className="p-2 border rounded">
                  <p style={{ fontFamily: "'Pacifico', cursive" }}>Display</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
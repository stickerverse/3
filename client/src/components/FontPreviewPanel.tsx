import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, Upload, Edit, ListFilter, Github } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FontGallery from './FontGallery';
import FontUploader from './FontUploader';
import GitHubFontBrowser from './GitHubFontBrowser';
import googleFontsService from '../lib/googleFontsService';
import githubFontService from '../lib/githubFontService';

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
  const [tab, setTab] = useState('all');
  const [showFontUploader, setShowFontUploader] = useState(false);

  // When a font is selected from the gallery
  const handleFontSelected = (font: string) => {
    setFont(font);
  };

  // When a font is uploaded
  const handleFontUploaded = (font: { family: string, fileName: string, url: string }) => {
    // Notify about the new font being added
    console.log(`Font ${font.family} uploaded successfully`);
    
    // Auto-select the newly uploaded font
    setTimeout(() => {
      setFont(font.family);
      
      // Switch to the local fonts tab
      setTab('local');
    }, 500);
  };

  if (!showFontPreview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-[90vw] max-w-5xl h-[90vh] max-h-[800px] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            <Type className="h-5 w-5 mr-2" />
            <h2 className="text-xl font-semibold">Font Explorer</h2>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFontPreview(false)}
          >
            Close
          </Button>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-1/3">
              <h3 className="text-sm font-medium mb-1">Preview Text</h3>
              <Input
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type preview text..."
                className="w-full"
              />
            </div>
            
            <div className="w-full md:w-2/3 flex items-center gap-2 flex-wrap">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-1">Selected Font</h3>
                <div 
                  className="border p-3 rounded-md text-center overflow-hidden text-ellipsis"
                  style={{ fontFamily: currentFont }}
                >
                  {currentFont || "No font selected"}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Actions</h3>
                <Button
                  onClick={() => setShowFontUploader(true)}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Font
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="p-4 border-b sticky top-0 bg-white dark:bg-neutral-900 z-10">
              <TabsList className="w-full">
                <TabsTrigger value="all">All Fonts</TabsTrigger>
                <TabsTrigger value="local">My Uploaded Fonts</TabsTrigger>
                <TabsTrigger value="github">
                  <Github className="h-4 w-4 mr-1" />
                  GitHub Fonts
                </TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="serif">Serif</TabsTrigger>
                <TabsTrigger value="sans-serif">Sans Serif</TabsTrigger>
                <TabsTrigger value="display">Display</TabsTrigger>
                <TabsTrigger value="handwriting">Handwriting</TabsTrigger>
                <TabsTrigger value="monospace">Monospace</TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-4">
              <TabsContent value="all" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'all'}
                />
              </TabsContent>
              
              <TabsContent value="local" className="m-0">
                {fontCategories['local'] && fontCategories['local'].length > 0 ? (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {fontCategories['local'].map(font => (
                        <button
                          key={font}
                          className={`
                            bg-white dark:bg-neutral-800 p-6 rounded-lg shadow hover:shadow-md
                            ${currentFont === font ? 'ring-2 ring-primary' : 'border border-neutral-200 dark:border-neutral-700'}
                            transition-all duration-200
                          `}
                          onClick={() => setFont(font)}
                        >
                          <div 
                            className="text-2xl mb-2 h-20 flex items-center justify-center"
                            style={{ fontFamily: font }}
                          >
                            {previewText || "Aa Bb Cc"}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                            {font}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Upload className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Custom Fonts Yet</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
                      Upload your own fonts to use in your designs. You can upload TTF, OTF, WOFF, or WOFF2 font files.
                    </p>
                    <Button onClick={() => setShowFontUploader(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Font
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="github" className="m-0">
                <GitHubFontBrowser 
                  onFontsLoaded={(fontNames) => {
                    // When GitHub fonts are loaded, update the categories
                    if (fontNames.length > 0) {
                      // Set the current font to the first font loaded
                      setFont(fontNames[0]);
                    }
                  }}
                />
              </TabsContent>
              
              <TabsContent value="popular" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'popular'}
                />
              </TabsContent>
              
              <TabsContent value="serif" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'serif'}
                />
              </TabsContent>
              
              <TabsContent value="sans-serif" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'sans-serif'}
                />
              </TabsContent>
              
              <TabsContent value="display" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'display'}
                />
              </TabsContent>
              
              <TabsContent value="handwriting" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'handwriting'}
                />
              </TabsContent>
              
              <TabsContent value="monospace" className="m-0">
                <FontGallery 
                  currentFont={currentFont}
                  onFontSelected={handleFontSelected}
                  sampleText={previewText || "The quick brown fox jumps over the lazy dog"}
                  visible={tab === 'monospace'}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
      
      {/* Font Uploader Modal */}
      <FontUploader 
        showUploader={showFontUploader}
        setShowUploader={setShowFontUploader}
        onFontUploaded={handleFontUploaded}
      />
    </div>
  );
}
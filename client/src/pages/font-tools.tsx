import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type as FontIcon, Upload, Edit3, Github } from 'lucide-react';
import FontGallery from '../components/FontGallery';
import FontCarouselPicker from '../components/FontCarouselPicker';
import FontUploader from '../components/FontUploader';
import FontPreviewPanel from '../components/FontPreviewPanel';
import GitHubFontBrowser from '../components/GitHubFontBrowser';
import googleFontsService from '../lib/googleFontsService';
import githubFontService from '../lib/githubFontService';

export default function FontToolsPage() {
  const [currentFont, setCurrentFont] = useState("Arial");
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [showFontPreview, setShowFontPreview] = useState(false);
  const [showFontUploader, setShowFontUploader] = useState(false);
  const [fontCategories, setFontCategories] = useState<Record<string, string[]>>({});
  
  useEffect(() => {
    const loadFontData = async () => {
      // Load font categories from Google Fonts
      await googleFontsService.fetchGoogleFonts();
      
      // Load GitHub fonts automatically
      try {
        await githubFontService.loadFontsFromGitHub("stickerverse/Fonts1");
      } catch (error) {
        console.error("Error loading GitHub fonts:", error);
      }
      
      // Update categories with both Google and GitHub fonts
      setFontCategories({...googleFontsService.categories});
    };
    
    loadFontData();
  }, []);
  
  const handleFontSelected = (font: string) => {
    setCurrentFont(font);
  };
  
  const handleFontUploaded = (font: { family: string, fileName: string, url: string }) => {
    setCurrentFont(font.family);
    // Update categories after upload
    setFontCategories({...googleFontsService.categories});
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Font Management Tools</h1>
        <p className="text-lg text-muted-foreground">
          Browse, preview, and select fonts for your designs
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Current Selection</CardTitle>
            <CardDescription>
              The currently selected font and preview text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="previewText">Preview Text</Label>
              <Input
                id="previewText"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type to preview..."
                className="mb-2"
              />
            </div>
            
            <div className="p-4 border rounded-md mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Font Preview</span>
                <span className="text-sm font-medium">{currentFont}</span>
              </div>
              <div
                className="text-3xl p-4 text-center"
                style={{ fontFamily: currentFont }}
              >
                {previewText || "The quick brown fox"}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowFontUploader(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Font
            </Button>
            <Button onClick={() => setShowFontPreview(true)}>
              <FontIcon className="h-4 w-4 mr-2" />
              Browse Fonts
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Font Selector</CardTitle>
            <CardDescription>
              Choose from popular fonts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FontCarouselPicker 
              currentFont={currentFont}
              onFontSelected={handleFontSelected}
              sampleText={previewText}
            />
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              onClick={() => setShowFontPreview(true)}
              className="w-full"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Show All Available Fonts
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border mb-12">
        <h2 className="text-xl font-bold mb-4">Local Font Management</h2>
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            You can upload your own font files to use in your designs. Supported formats include TTF, OTF, WOFF, and WOFF2.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFontUploader(true)}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Font File
            </Button>
            
            <Button
              variant="default"
              onClick={() => setShowFontPreview(true)}
              className="flex-1"
            >
              <FontIcon className="h-4 w-4 mr-2" />
              Browse All Fonts
            </Button>
          </div>
        </div>
        
        {fontCategories['local'] && fontCategories['local'].length > 0 ? (
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-4">Your Uploaded Fonts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fontCategories['local'].map(font => (
                <button
                  key={font}
                  className={`
                    p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 
                    ${currentFont === font ? 'border-primary bg-primary/5' : ''}
                    transition-colors
                  `}
                  onClick={() => setCurrentFont(font)}
                >
                  <div 
                    className="text-2xl mb-2 truncate"
                    style={{ fontFamily: font }}
                  >
                    {previewText || "Aa Bb Cc"}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {font}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 border border-dashed rounded-md">
            <p className="text-muted-foreground mb-4">
              You haven't uploaded any custom fonts yet.
            </p>
            <Button onClick={() => setShowFontUploader(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Your First Font
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border mb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Github className="h-5 w-5 mr-2 text-primary" />
          GitHub Font Repository
        </h2>
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Load fonts directly from a GitHub repository. The default repository is <code>stickerverse/Fonts1</code>.
          </p>
          
          <GitHubFontBrowser 
            onFontsLoaded={(fontNames) => {
              if (fontNames.length > 0) {
                // Update font categories
                setFontCategories({...googleFontsService.categories});
                
                // Set the current font to the first loaded font
                setCurrentFont(fontNames[0]);
              }
            }}
          />
        </div>
        
        {fontCategories['github'] && fontCategories['github'].length > 0 ? (
          <div className="border rounded-md p-4 mt-8">
            <h3 className="text-lg font-medium mb-4">GitHub Fonts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fontCategories['github'].map(font => (
                <button
                  key={font}
                  className={`
                    p-4 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 
                    ${currentFont === font ? 'border-primary bg-primary/5' : ''}
                    transition-colors
                  `}
                  onClick={() => setCurrentFont(font)}
                >
                  <div 
                    className="text-2xl mb-2 truncate"
                    style={{ fontFamily: font }}
                  >
                    {previewText || "Aa Bb Cc"}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {font}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Font Preview Panel */}
      <FontPreviewPanel 
        showFontPreview={showFontPreview}
        setShowFontPreview={setShowFontPreview}
        previewText={previewText}
        setPreviewText={setPreviewText}
        currentFont={currentFont}
        setFont={setCurrentFont}
        fontCategories={fontCategories}
      />
      
      {/* Font Uploader */}
      <FontUploader 
        showUploader={showFontUploader}
        setShowUploader={setShowFontUploader}
        onFontUploaded={handleFontUploaded}
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Github, RefreshCw, Check } from 'lucide-react';
import githubFontService from '../lib/githubFontService';
import googleFontsService from '../lib/googleFontsService';

interface GitHubFontBrowserProps {
  onFontsLoaded?: (fontNames: string[]) => void;
  onClose?: () => void;
}

export default function GitHubFontBrowser({
  onFontsLoaded,
  onClose
}: GitHubFontBrowserProps) {
  const [repoUrl, setRepoUrl] = useState("stickerverse/Fonts1");
  const [isLoading, setIsLoading] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [loadComplete, setLoadComplete] = useState(false);

  // Load fonts from the default repository on mount
  useEffect(() => {
    loadFontsFromRepo();
  }, []);

  const loadFontsFromRepo = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const fontNames = await githubFontService.loadFontsFromGitHub(repoUrl);
      setLoadedFonts(fontNames);
      
      if (fontNames.length === 0) {
        setError("No font files found in this repository.");
      } else {
        setLoadComplete(true);
        
        if (onFontsLoaded) {
          onFontsLoaded(fontNames);
        }
      }
    } catch (err) {
      console.error("Error loading fonts from GitHub:", err);
      setError("Failed to load fonts from the repository. Please check the URL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadComplete(false);
    loadFontsFromRepo();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Font Repository
        </CardTitle>
        <CardDescription>
          Load fonts from a GitHub repository to use in your designs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <div className="flex gap-2">
              <Input
                id="repoUrl"
                placeholder="username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !repoUrl || repoUrl.trim() === ""}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Load Fonts"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a GitHub repository in the format "username/repository"
            </p>
            {isLoading && (
              <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 animate-pulse">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading fonts from GitHub repository...</span>
              </div>
            )}
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {loadComplete && loadedFonts.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
              <Check className="h-5 w-5" />
              <span className="font-medium">
                Successfully loaded {loadedFonts.length} fonts from GitHub
              </span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="previewText">Preview Text</Label>
              <Input
                id="previewText"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type to preview fonts..."
              />
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
              {loadedFonts.map((fontName, index) => (
                <div 
                  key={`github-browser-font-${index}-${fontName}`}
                  className="border p-4 rounded-md hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div
                    className="text-xl mb-2 h-14 flex items-center justify-center overflow-hidden"
                    style={{ fontFamily: fontName }}
                  >
                    {previewText || "Aa Bb Cc"}
                  </div>
                  <div className="text-sm text-center truncate font-medium">
                    {fontName}
                  </div>
                </div>
              ))}
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
            All fonts are ready to use in your designs
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import githubFontService from "@/lib/githubFontService";
import { useToast } from "@/hooks/use-toast";

interface GitHubFontPreviewerProps {
  onFontSelected: (font: string) => void;
  defaultText?: string;
  repoUrl?: string;
}

export default function GitHubFontPreviewer({
  onFontSelected,
  defaultText = "The quick brown fox jumps over the lazy dog",
  repoUrl = "stickerverse/Fonts1"
}: GitHubFontPreviewerProps) {
  const [previewText, setPreviewText] = useState(defaultText);
  const [isLoading, setIsLoading] = useState(true);
  const [fontNames, setFontNames] = useState<string[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>("");
  const [error, setError] = useState("");
  const { toast } = useToast();

  const loadFonts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Load fonts from GitHub repo
      const loadedFonts = await githubFontService.loadFontsFromGitHub(repoUrl);
      
      if (loadedFonts.length === 0) {
        setError("No fonts found in the GitHub repository.");
        toast({
          title: "No fonts found",
          description: "The GitHub repository doesn't contain any font files.",
          variant: "destructive"
        });
      } else {
        setFontNames(loadedFonts);
        // Set first font as selected by default
        if (loadedFonts.length > 0 && !selectedFont) {
          setSelectedFont(loadedFonts[0]);
        }
      }
    } catch (error) {
      console.error("Error loading GitHub fonts:", error);
      setError("Failed to load fonts from GitHub repository.");
      toast({
        title: "Font loading error",
        description: "Could not load fonts from GitHub. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, selectedFont, toast]);

  // Load fonts when component mounts
  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  const handleFontSelection = (font: string) => {
    setSelectedFont(font);
    onFontSelected(font);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">GitHub Font Previewer</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type to preview text..."
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="max-w-xs"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadFonts} 
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading fonts from GitHub...</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto p-2">
            {fontNames.map((font, index) => (
              <div
                key={`${font}-${index}`}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${selectedFont === font ? 'border-primary bg-primary/5' : 'border-neutral-200 dark:border-neutral-700'}
                `}
                onClick={() => handleFontSelection(font)}
              >
                <div className="flex flex-col h-full">
                  <div
                    className="flex-1 flex items-center justify-center min-h-20 mb-2 overflow-hidden"
                    style={{ fontFamily: font }}
                  >
                    <p className="text-base sm:text-lg md:text-xl text-center line-clamp-3 break-words">
                      {previewText || "Aa"}
                    </p>
                  </div>
                  <div className="text-xs text-center truncate border-t pt-2 font-mono">
                    {font}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-xs text-neutral-500 text-center">
            {fontNames.length} fonts loaded from GitHub repository: {repoUrl}
          </div>
        </div>
      )}
    </div>
  );
}

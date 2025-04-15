
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import GitHubFontPreviewer from "@/components/GitHubFontPreviewer";

export default function GitHubFontsPage() {
  const [selectedFont, setSelectedFont] = useState<string>("");
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog");
  const [githubRepo, setGithubRepo] = useState("stickerverse/Fonts1");

  const handleFontSelected = (font: string) => {
    setSelectedFont(font);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">GitHub Fonts</h1>
          <p className="text-muted-foreground">
            Preview and select fonts from GitHub repositories for your designs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>GitHub Font Preview</CardTitle>
            <CardDescription>
              Currently showing fonts from repository: <code>{githubRepo}</code>
            </CardDescription>
            
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="GitHub repository (e.g. username/repo)"
                className="max-w-md"
              />
              <Button variant="outline">
                Change Repository
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {selectedFont && (
              <div className="mb-6 p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">Selected Font: {selectedFont}</div>
                <div 
                  className="text-3xl" 
                  style={{ fontFamily: selectedFont }}
                >
                  {previewText}
                </div>
              </div>
            )}
            
            <GitHubFontPreviewer 
              onFontSelected={handleFontSelected}
              defaultText={previewText}
              repoUrl={githubRepo}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

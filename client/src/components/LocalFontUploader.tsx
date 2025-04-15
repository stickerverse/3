import { useState, useCallback, useRef } from "react";
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
import { Upload, X, Check } from "lucide-react";
import googleFontsService from "../lib/googleFontsService";

interface LocalFontUploaderProps {
  onFontUploaded: (font: { family: string; url: string }) => void;
  onClose: () => void;
}

export default function LocalFontUploader({
  onFontUploaded,
  onClose
}: LocalFontUploaderProps) {
  const [fontName, setFontName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf', 'application/font-woff', 'application/font-woff2'];
      
      // Some browsers might not properly identify font MIME types
      const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
      const hasValidExtension = validExtensions.some(ext => 
        selectedFile.name.toLowerCase().endsWith(ext)
      );
      
      if (!validTypes.includes(selectedFile.type) && !hasValidExtension) {
        setError("Please upload a valid font file (TTF, OTF, WOFF, or WOFF2)");
        setFile(null);
        setFileUrl("");
        return;
      }
      
      setFile(selectedFile);
      setError("");
      
      // Create a URL for the file
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      
      // If no font name is set, use the file name without extension
      if (!fontName) {
        const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFontName(nameWithoutExtension);
      }
    }
  }, [fontName]);

  const uploadFont = useCallback(async () => {
    if (!file || !fontName.trim()) {
      setError("Please select a font file and provide a font name");
      return;
    }
    
    setIsUploading(true);
    setError("");
    
    try {
      // Create @font-face CSS rule to load the local font
      const fontFace = new FontFace(fontName, `url(${fileUrl})`);
      
      // Wait for the font to load
      await fontFace.load();
      
      // Add the font to the document
      document.fonts.add(fontFace);
      
      // Register the font with our font service
      googleFontsService.registerLocalFont(fontName, fileUrl);
      
      // Notify parent component
      onFontUploaded({
        family: fontName,
        url: fileUrl
      });
      
      setUploadComplete(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error loading font:", err);
      setError("Failed to load the font. Please try another font file.");
    } finally {
      setIsUploading(false);
    }
  }, [file, fontName, fileUrl, onFontUploaded, onClose]);

  const resetForm = () => {
    setFontName("");
    setFile(null);
    setFileUrl("");
    setError("");
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Local Font</CardTitle>
        <CardDescription>
          Upload your own font files to use in your designs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fontName">Font Name</Label>
            <Input
              id="fontName"
              placeholder="Enter a name for your font"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
              disabled={isUploading || uploadComplete}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fontFile">Font File</Label>
            {!file ? (
              <div 
                className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Click to upload or drag and drop<br />
                  TTF, OTF, WOFF, or WOFF2
                </p>
                <Input
                  id="fontFile"
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isUploading || uploadComplete}
                />
              </div>
            ) : (
              <div className="flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center">
                  <div className="flex-1 truncate ml-2">
                    {file.name}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUploading || uploadComplete}
                  onClick={resetForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {fileUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div 
                className="border rounded-md p-4 text-center text-2xl"
                style={{ fontFamily: fontName, fontDisplay: 'swap' }}
              >
                {fontName} - The quick brown fox
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button 
          onClick={uploadFont} 
          disabled={!file || !fontName || isUploading || uploadComplete}
          className="relative"
        >
          {uploadComplete ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Added Successfully
            </>
          ) : isUploading ? "Adding Font..." : "Add Font"}
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface FontUploaderProps {
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFontUploaded?: (font: { family: string, fileName: string, url: string }) => void;
}

export default function FontUploader({
  showUploader,
  setShowUploader,
  onFontUploaded
}: FontUploaderProps) {
  const [fontName, setFontName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validFileTypes = [
        'font/ttf', 
        'font/otf', 
        'font/woff', 
        'font/woff2',
        'application/x-font-ttf',
        'application/x-font-otf', 
        'application/font-woff',
        'application/font-woff2'
      ];

      // Some browsers don't set the correct MIME type, so we also check extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const isValidExtension = ['ttf', 'otf', 'woff', 'woff2'].includes(fileExtension || '');

      if (validFileTypes.includes(selectedFile.type) || isValidExtension) {
        setFile(selectedFile);
        setError("");

        // Auto-generate font name from file name if not set
        if (!fontName) {
          const nameFromFile = selectedFile.name
            .replace(/\.(ttf|otf|woff|woff2)$/i, '')
            .split(/[-_]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');

          setFontName(nameFromFile);
        }
      } else {
        setFile(null);
        setError("Invalid file type. Please upload a TTF, OTF, WOFF, or WOFF2 font file.");
      }
    }
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        setError("Please select a font file to upload");
        return;
      }

      if (!fontName.trim()) {
        setError("Please enter a name for your font");
        return;
      }

      setIsUploading(true);
      setError("");

      // Read file as base64
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          const fileExtension = file.name.split('.').pop()?.toLowerCase();

          const response = await apiRequest('POST', '/api/fonts/upload', {
            fontName: fontName.trim(),
            fontFile: base64Data,
            fontType: fileExtension
          });

          if (response.ok) {
            const result = await response.json();

            // Invalidate font queries to refresh the font list
            queryClient.invalidateQueries({ queryKey: ['/api/fonts/local'] });

            toast({
              title: "Font uploaded successfully",
              description: `Font '${fontName}' is now available in the font selector`,
            });

            // Reset form
            setFontName("");
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }

            // Notify parent component
            if (onFontUploaded) {
              onFontUploaded({
                family: result.fontName,
                fileName: result.fileName,
                url: result.url
              });
            }

            // Close the modal
            setShowUploader(false);
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to upload font");
          }
        } catch (error: any) {
          console.error("Error uploading font:", error);
          setError(error.message || "Failed to upload font");
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setError("Error reading the font file");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error preparing upload:", error);
      setError(error.message || "An unexpected error occurred");
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  return (
    <Dialog open={showUploader} onOpenChange={setShowUploader}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Upload Custom Font</DialogTitle>
          <DialogDescription>
            Upload custom font files to use in your designs
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fontName" className="text-left">Font Name</Label>
            <Input
              id="fontName"
              placeholder="Enter a name for your font"
              value={fontName}
              onChange={(e) => setFontName(e.target.value)}
            />
          </div>

          <div 
            className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                {file ? file.name : "Drag and drop your font file here"}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports TTF, OTF, WOFF, and WOFF2 formats
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUploader(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || !file}
          >
            {isUploading ? "Uploading..." : "Upload Font"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
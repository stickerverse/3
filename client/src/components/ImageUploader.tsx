import { useState, useRef } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription,
  DialogFooter,
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (imageData: string, options?: { scale?: number, filter?: string }) => void;
}

type ImageSource = "upload" | "url";

export default function ImageUploader({ 
  isOpen, 
  onClose, 
  onImageSelected 
}: ImageUploaderProps) {
  const [imageSource, setImageSource] = useState<ImageSource>("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageScale, setImageScale] = useState(100); // percentage
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Predefined filters for images
  const filters = [
    { id: "none", name: "None", css: "" },
    { id: "grayscale", name: "Grayscale", css: "grayscale(100%)" },
    { id: "sepia", name: "Sepia", css: "sepia(100%)" },
    { id: "invert", name: "Invert", css: "invert(100%)" },
    { id: "blur", name: "Blur", css: "blur(2px)" },
    { id: "brightness", name: "Bright", css: "brightness(150%)" },
    { id: "contrast", name: "Contrast", css: "contrast(200%)" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (PNG, JPG, JPEG, GIF, or SVG).",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL required",
        description: "Please enter an image URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create a test image to see if URL is valid
      const testImage = new Image();
      testImage.onload = () => {
        setUploadedImage(imageUrl);
        setIsLoading(false);
      };
      
      testImage.onerror = () => {
        toast({
          title: "Invalid URL",
          description: "Could not load image from the provided URL",
          variant: "destructive"
        });
        setIsLoading(false);
      };

      testImage.src = imageUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load image from the provided URL",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image or provide a URL",
        variant: "destructive"
      });
      return;
    }

    onImageSelected(uploadedImage, {
      scale: imageScale / 100,
      filter: selectedFilter !== "none" ? selectedFilter : undefined
    });
    
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImageUrl("");
    setImageScale(100);
    setSelectedFilter("none");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFilterStyle = (filterId: string) => {
    const filter = filters.find(f => f.id === filterId);
    return filter ? filter.css : "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>
            Upload an image or provide a URL
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="upload" value={imageSource} onValueChange={(v) => setImageSource(v as ImageSource)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
            <TabsTrigger value="url">Image URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="py-4">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image-upload">Select Image</Label>
                <Input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="py-4">
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image-url">Image URL</Label>
                <div className="flex gap-2">
                  <Input 
                    id="image-url" 
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? "Loading..." : "Load"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {uploadedImage && (
          <div className="space-y-4 mt-4">
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-md p-2 bg-white dark:bg-black">
              <div className="aspect-square w-full flex items-center justify-center overflow-hidden">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain transition-all"
                  style={{ 
                    transform: `scale(${imageScale / 100})`,
                    filter: getFilterStyle(selectedFilter)
                  }} 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-scale" className="mb-1 block">Scale: {imageScale}%</Label>
                <Slider 
                  id="image-scale"
                  value={[imageScale]} 
                  min={10} 
                  max={200} 
                  step={1}
                  onValueChange={(value) => setImageScale(value[0])}
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Filter</Label>
                <div className="grid grid-cols-4 gap-2">
                  {filters.map((filter) => (
                    <div
                      key={filter.id}
                      className={`cursor-pointer rounded-md p-1 text-center text-xs transition-all hover:bg-primary/10 ${selectedFilter === filter.id ? 'bg-primary/20 font-medium' : ''}`}
                      onClick={() => setSelectedFilter(filter.id)}
                    >
                      {filter.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleConfirm} disabled={!uploadedImage}>
              Add to Canvas
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
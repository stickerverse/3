import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import VinylSizeSelector from "./VinylSizeSelector";
import VinylMaterialSelector from "./VinylMaterialSelector";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VinylPropertiesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialSizeId?: number | null;
  initialMaterialId?: number | null;
  initialDimensions?: { width: number, height: number } | null;
  onSave: (properties: {
    sizeId: number | null,
    materialId: number | null,
    dimensions: { width: number, height: number } | null
  }) => void;
}

export default function VinylPropertiesDialog({
  isOpen,
  onClose,
  initialSizeId = null,
  initialMaterialId = null,
  initialDimensions = null,
  onSave
}: VinylPropertiesDialogProps) {
  const [activeTab, setActiveTab] = useState("size");
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(initialSizeId);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(initialMaterialId);
  const [customDimensions, setCustomDimensions] = useState<{ width: number, height: number } | null>(
    initialDimensions || { width: 100, height: 100 }
  );
  const [useCustomDimensions, setUseCustomDimensions] = useState<boolean>(!!initialDimensions && !initialSizeId);

  const { toast } = useToast();

  // Reset form when dialog opens with new initialValues
  useEffect(() => {
    if (isOpen) {
      setSelectedSizeId(initialSizeId);
      setSelectedMaterialId(initialMaterialId);
      setCustomDimensions(initialDimensions || { width: 100, height: 100 });
      setUseCustomDimensions(!!initialDimensions && !initialSizeId);
    }
  }, [isOpen, initialSizeId, initialMaterialId, initialDimensions]);

  const handleSizeSelected = (sizeId: number, dimensions: { width: number, height: number }) => {
    setSelectedSizeId(sizeId);
    setCustomDimensions(dimensions);
    setUseCustomDimensions(false);
  };

  const handleMaterialSelected = (materialId: number) => {
    setSelectedMaterialId(materialId);
  };

  const handleCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value) || 0;
    setCustomDimensions(prev => ({ ...(prev || { width: 0, height: 0 }), width }));
  };

  const handleCustomHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const height = parseInt(e.target.value) || 0;
    setCustomDimensions(prev => ({ ...(prev || { width: 0, height: 0 }), height }));
  };

  const handleSave = () => {
    // Validate dimensions
    if (useCustomDimensions && customDimensions) {
      if (customDimensions.width <= 0 || customDimensions.height <= 0) {
        toast({
          title: "Invalid dimensions",
          description: "Width and height must be greater than 0",
          variant: "destructive"
        });
        return;
      }
    }

    onSave({
      sizeId: useCustomDimensions ? null : selectedSizeId,
      materialId: selectedMaterialId,
      dimensions: useCustomDimensions ? customDimensions : null
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vinyl Properties</DialogTitle>
          <DialogDescription>
            Configure the size and material for your vinyl design.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="material">Material</TabsTrigger>
          </TabsList>

          <TabsContent value="size" className="mt-4">
            <div className="mb-6">
              <VinylSizeSelector 
                selectedSizeId={useCustomDimensions ? null : selectedSizeId}
                onSizeSelected={handleSizeSelected}
                showCustom={true}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="useCustomDimensions" 
                  checked={useCustomDimensions} 
                  onChange={(e) => setUseCustomDimensions(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="useCustomDimensions">Use custom dimensions</Label>
              </div>

              {useCustomDimensions && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customWidth">Width (mm)</Label>
                    <Input
                      id="customWidth"
                      type="number"
                      min="10"
                      value={customDimensions?.width || 100}
                      onChange={handleCustomWidthChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customHeight">Height (mm)</Label>
                    <Input
                      id="customHeight"
                      type="number"
                      min="10"
                      value={customDimensions?.height || 100}
                      onChange={handleCustomHeightChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="material" className="mt-4">
            <VinylMaterialSelector 
              selectedMaterialId={selectedMaterialId}
              onMaterialSelected={handleMaterialSelected}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
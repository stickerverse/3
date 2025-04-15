import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import VinylSizeSelector from './VinylSizeSelector';
import VinylMaterialSelector from './VinylMaterialSelector';

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
  const [activeTab, setActiveTab] = useState('size');
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(initialSizeId);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(initialMaterialId);
  const [dimensions, setDimensions] = useState<{ width: number, height: number } | null>(initialDimensions);
  const { toast } = useToast();

  // Update local state when props change
  useEffect(() => {
    if (isOpen) {
      setSelectedSizeId(initialSizeId);
      setSelectedMaterialId(initialMaterialId);
      setDimensions(initialDimensions);
    }
  }, [isOpen, initialSizeId, initialMaterialId, initialDimensions]);

  const handleSizeSelected = (sizeId: number, dims: { width: number, height: number }) => {
    setSelectedSizeId(sizeId);
    setDimensions(dims);
  };

  const handleMaterialSelected = (materialId: number) => {
    setSelectedMaterialId(materialId);
  };

  const handleSave = () => {
    if (!selectedMaterialId) {
      toast({
        title: "Missing material",
        description: "Please select a material for your vinyl design",
        variant: "destructive"
      });
      setActiveTab('material');
      return;
    }

    if (!dimensions) {
      toast({
        title: "Missing size",
        description: "Please select a size for your vinyl design",
        variant: "destructive"
      });
      setActiveTab('size');
      return;
    }

    onSave({
      sizeId: selectedSizeId,
      materialId: selectedMaterialId,
      dimensions
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Vinyl Properties</DialogTitle>
          <DialogDescription>
            Choose the size and material for your vinyl design
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="size" value={activeTab} onValueChange={setActiveTab} className="mt-4 flex-1 overflow-hidden flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="size">Size</TabsTrigger>
            <TabsTrigger value="material">Material</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="size" className="h-full overflow-y-auto">
              <VinylSizeSelector
                selectedSizeId={selectedSizeId}
                onSizeSelected={handleSizeSelected}
              />
            </TabsContent>

            <TabsContent value="material" className="h-full overflow-y-auto">
              <VinylMaterialSelector
                selectedMaterialId={selectedMaterialId}
                onMaterialSelected={handleMaterialSelected}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 flex justify-between items-center">
          <div className="flex space-x-4">
            {activeTab === 'size' ? (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('material')}
              >
                Next: Material
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('size')}
              >
                Back to Size
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Apply Changes</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
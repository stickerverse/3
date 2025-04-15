import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ruler, Square, Tag, Plus, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VinylSize {
  id: number;
  name: string;
  width: number; // in mm
  height: number; // in mm
  description: string | null;
  recommendedFor: string | null;
  default: boolean;
}

interface SizeSelectionProps {
  selectedSizeId: number | null;
  onSizeSelected: (sizeId: number, dimensions: { width: number, height: number }) => void;
  showCustom?: boolean;
}

export default function VinylSizeSelector({
  selectedSizeId,
  onSizeSelected,
  showCustom = true
}: SizeSelectionProps) {
  const [customWidth, setCustomWidth] = useState(100);
  const [customHeight, setCustomHeight] = useState(100);
  const [sizeCategory, setSizeCategory] = useState('popular');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available vinyl sizes
  const { data: vinylSizes, isLoading, error } = useQuery({
    queryKey: ['/api/vinyl-sizes'],
    async queryFn() {
      const res = await apiRequest('GET', '/api/vinyl-sizes');
      if (!res.ok) throw new Error('Failed to fetch vinyl sizes');
      return (await res.json()) as VinylSize[];
    }
  });

  // Use default size if none selected and default exists
  useEffect(() => {
    if (!selectedSizeId && vinylSizes && vinylSizes.length > 0) {
      const defaultSize = vinylSizes.find(size => size.default);
      if (defaultSize) {
        onSizeSelected(defaultSize.id, { width: defaultSize.width, height: defaultSize.height });
      } else if (vinylSizes.length > 0) {
        // Just use the first size if no default
        const firstSize = vinylSizes[0];
        onSizeSelected(firstSize.id, { width: firstSize.width, height: firstSize.height });
      }
    }
  }, [vinylSizes, selectedSizeId, onSizeSelected]);

  // Group sizes by category
  const smallSizes = vinylSizes?.filter(size => size.width <= 150 && size.height <= 150) || [];
  const mediumSizes = vinylSizes?.filter(size => 
    (size.width > 150 && size.width <= 300) || (size.height > 150 && size.height <= 300)
  ) || [];
  const largeSizes = vinylSizes?.filter(size => size.width > 300 || size.height > 300) || [];
  const popularSizes = vinylSizes?.filter(size => size.default || smallSizes.slice(0, 2).includes(size) || mediumSizes.slice(0, 2).includes(size)) || [];

  const handleSizeSelect = (size: VinylSize) => {
    onSizeSelected(size.id, { width: size.width, height: size.height });
  };

  const handleCustomSizeSubmit = () => {
    if (customWidth < 10 || customHeight < 10) {
      toast({
        title: "Invalid dimensions",
        description: "Minimum size is 10mm x 10mm",
        variant: "destructive"
      });
      return;
    }

    if (customWidth > 1000 || customHeight > 1000) {
      toast({
        title: "Size too large",
        description: "Maximum size is 1000mm x 1000mm",
        variant: "destructive"
      });
      return;
    }

    // For custom sizes, we pass null as the ID to indicate it's custom
    onSizeSelected(-1, { width: customWidth, height: customHeight });
  };

  const getSelectedSize = () => {
    if (!vinylSizes) return null;
    return vinylSizes.find(size => size.id === selectedSizeId);
  };

  const getSizeDisplayText = (size: VinylSize) => {
    return `${size.width}mm × ${size.height}mm`;
  };

  return (
    <div className="vinyl-size-selector">
      <Tabs defaultValue="popular" value={sizeCategory} onValueChange={setSizeCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="popular" className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="small" className="flex items-center">
            <Square className="mr-2 h-4 w-4" />
            Small
          </TabsTrigger>
          <TabsTrigger value="medium" className="flex items-center">
            <Square className="mr-2 h-4 w-4" />
            Medium
          </TabsTrigger>
          <TabsTrigger value="large" className="flex items-center">
            <Square className="mr-2 h-4 w-4" />
            Large
          </TabsTrigger>
          {showCustom && (
            <TabsTrigger value="custom" className="flex items-center">
              <Ruler className="mr-2 h-4 w-4" />
              Custom
            </TabsTrigger>
          )}
        </TabsList>

        <div className="size-options">
          <TabsContent value="popular">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedSizeId?.toString() || undefined} 
                onValueChange={(value) => {
                  const sizeId = parseInt(value);
                  const size = vinylSizes?.find(s => s.id === sizeId);
                  if (size) {
                    handleSizeSelect(size);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && popularSizes.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No popular sizes available
                    </div>
                  )}
                  
                  {popularSizes.map((size) => (
                    <div key={size.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={size.id.toString()} 
                        id={`size-${size.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`size-${size.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {size.name}
                          {size.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {getSizeDisplayText(size)}
                        </div>
                        {size.recommendedFor && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Recommended for: {size.recommendedFor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="small">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedSizeId?.toString() || undefined} 
                onValueChange={(value) => {
                  const sizeId = parseInt(value);
                  const size = vinylSizes?.find(s => s.id === sizeId);
                  if (size) {
                    handleSizeSelect(size);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && smallSizes.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No small sizes available
                    </div>
                  )}
                  
                  {smallSizes.map((size) => (
                    <div key={size.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={size.id.toString()} 
                        id={`size-${size.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`size-${size.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {size.name}
                          {size.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {getSizeDisplayText(size)}
                        </div>
                        {size.recommendedFor && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Recommended for: {size.recommendedFor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="medium">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedSizeId?.toString() || undefined} 
                onValueChange={(value) => {
                  const sizeId = parseInt(value);
                  const size = vinylSizes?.find(s => s.id === sizeId);
                  if (size) {
                    handleSizeSelect(size);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && mediumSizes.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No medium sizes available
                    </div>
                  )}
                  
                  {mediumSizes.map((size) => (
                    <div key={size.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={size.id.toString()} 
                        id={`size-${size.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`size-${size.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {size.name}
                          {size.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {getSizeDisplayText(size)}
                        </div>
                        {size.recommendedFor && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Recommended for: {size.recommendedFor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="large">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedSizeId?.toString() || undefined} 
                onValueChange={(value) => {
                  const sizeId = parseInt(value);
                  const size = vinylSizes?.find(s => s.id === sizeId);
                  if (size) {
                    handleSizeSelect(size);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && largeSizes.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No large sizes available
                    </div>
                  )}
                  
                  {largeSizes.map((size) => (
                    <div key={size.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={size.id.toString()} 
                        id={`size-${size.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`size-${size.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {size.name}
                          {size.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {getSizeDisplayText(size)}
                        </div>
                        {size.recommendedFor && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Recommended for: {size.recommendedFor}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          {showCustom && (
            <TabsContent value="custom">
              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-base font-medium">Custom Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="custom-width">Width (mm)</Label>
                    <Input
                      id="custom-width"
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseInt(e.target.value) || 0)}
                      min={10}
                      max={1000}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-height">Height (mm)</Label>
                    <Input
                      id="custom-height"
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseInt(e.target.value) || 0)}
                      min={10}
                      max={1000}
                    />
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Info className="h-3 w-3 mr-1" />
                  <span>Dimensions should be between 10mm and 1000mm</span>
                </div>
                <Button 
                  onClick={handleCustomSizeSubmit} 
                  className="w-full mt-2"
                >
                  Apply Custom Size
                </Button>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>

      {selectedSizeId && selectedSizeId !== -1 && (
        <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Selected Size</h4>
              <p className="text-sm text-muted-foreground">
                {getSelectedSize()?.name} - {getSelectedSize() ? getSizeDisplayText(getSelectedSize()!) : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedSizeId === -1 && (
        <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Custom Size</h4>
              <p className="text-sm text-muted-foreground">
                {customWidth}mm × {customHeight}mm
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
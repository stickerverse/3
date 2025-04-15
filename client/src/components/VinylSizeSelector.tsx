import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  showCustom = false
}: SizeSelectionProps) {
  const { toast } = useToast();

  // Fetch vinyl sizes from API
  const { data: sizes, isLoading, isError } = useQuery({
    queryKey: ['/api/vinyl-sizes'],
    async queryFn() {
      try {
        const response = await apiRequest('GET', '/api/vinyl-sizes', undefined);
        
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error('Failed to fetch vinyl sizes');
        }
      } catch (error) {
        toast({
          title: "Failed to load vinyl sizes",
          description: "There was an error loading vinyl sizes.",
          variant: "destructive"
        });
        throw error;
      }
    }
  });

  // If no size is selected yet and we have sizes, select the default one
  useEffect(() => {
    if (!selectedSizeId && sizes && sizes.length > 0) {
      // Find the default size or use the first one
      const defaultSize = sizes.find((size: VinylSize) => size.default) || sizes[0];
      
      // Call the selection handler with the size ID and dimensions
      handleSizeSelect(defaultSize);
    }
  }, [sizes, selectedSizeId]);

  const handleSizeSelect = (size: VinylSize) => {
    onSizeSelected(size.id, { width: size.width, height: size.height });
  };

  const getSizeDisplayText = (size: VinylSize) => {
    return `${size.width}mm × ${size.height}mm`;
  };

  if (isLoading) {
    return <div className="py-6 text-center">Loading available sizes...</div>;
  }

  if (isError || !sizes) {
    return (
      <div className="py-6 text-center text-destructive">
        Failed to load vinyl sizes. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedSizeId?.toString() || ""} 
        onValueChange={(value) => {
          const size = sizes.find((s: VinylSize) => s.id.toString() === value);
          if (size) {
            handleSizeSelect(size);
          }
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sizes.map((size: VinylSize) => (
            <div key={size.id} className="flex items-start space-x-2">
              <RadioGroupItem value={size.id.toString()} id={`size-${size.id}`} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor={`size-${size.id}`} className="font-medium flex justify-between">
                  <span>{size.name}</span>
                  <span className="text-muted-foreground">{getSizeDisplayText(size)}</span>
                </Label>
                {size.description && (
                  <p className="text-sm text-muted-foreground mt-1">{size.description}</p>
                )}
                {size.recommendedFor && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    Recommended for: {size.recommendedFor}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
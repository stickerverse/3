import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VinylMaterial {
  id: number;
  name: string;
  type: string; // indoor, outdoor, specialty
  color: string | null;
  durability: string | null;
  description: string | null;
  default: boolean;
}

interface MaterialSelectionProps {
  selectedMaterialId: number | null;
  onMaterialSelected: (materialId: number) => void;
}

export default function VinylMaterialSelector({
  selectedMaterialId,
  onMaterialSelected
}: MaterialSelectionProps) {
  const { toast } = useToast();

  // Fetch vinyl materials from API
  const { data: materials, isLoading, isError } = useQuery({
    queryKey: ['/api/vinyl-materials'],
    async queryFn() {
      try {
        const response = await apiRequest('GET', '/api/vinyl-materials', undefined);
        
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error('Failed to fetch vinyl materials');
        }
      } catch (error) {
        toast({
          title: "Failed to load vinyl materials",
          description: "There was an error loading vinyl materials.",
          variant: "destructive"
        });
        throw error;
      }
    }
  });

  // If no material is selected yet and we have materials, select the default one
  useEffect(() => {
    if (!selectedMaterialId && materials && materials.length > 0) {
      // Find the default material or use the first one
      const defaultMaterial = materials.find((material: VinylMaterial) => material.default) || materials[0];
      
      // Call the selection handler with the material ID
      handleMaterialSelect(defaultMaterial);
    }
  }, [materials, selectedMaterialId]);

  const handleMaterialSelect = (material: VinylMaterial) => {
    onMaterialSelected(material.id);
  };

  if (isLoading) {
    return <div className="py-6 text-center">Loading available materials...</div>;
  }

  if (isError || !materials) {
    return (
      <div className="py-6 text-center text-destructive">
        Failed to load vinyl materials. Please try again.
      </div>
    );
  }

  // Group materials by type
  const groupedMaterials: Record<string, VinylMaterial[]> = {};
  materials.forEach((material: VinylMaterial) => {
    if (!groupedMaterials[material.type]) {
      groupedMaterials[material.type] = [];
    }
    groupedMaterials[material.type].push(material);
  });

  return (
    <div className="space-y-6">
      <RadioGroup 
        value={selectedMaterialId?.toString() || ""} 
        onValueChange={(value) => {
          const material = materials.find((m: VinylMaterial) => m.id.toString() === value);
          if (material) {
            handleMaterialSelect(material);
          }
        }}
      >
        {Object.entries(groupedMaterials).map(([type, typeItems]) => (
          <div key={type} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase">{type}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {typeItems.map((material) => (
                <div key={material.id} className="flex items-start space-x-2">
                  <RadioGroupItem 
                    value={material.id.toString()} 
                    id={`material-${material.id}`} 
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`material-${material.id}`} className="font-medium">
                        {material.name}
                      </Label>
                      {material.color && (
                        <span 
                          className="h-4 w-4 rounded-full border" 
                          style={{ backgroundColor: material.color }}
                        />
                      )}
                    </div>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                    )}
                    {material.durability && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Durability:</span> {material.durability}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers, Star, SquareAsterisk, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  const [materialCategory, setMaterialCategory] = useState('popular');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all available vinyl materials
  const { data: vinylMaterials, isLoading, error } = useQuery({
    queryKey: ['/api/vinyl-materials'],
    async queryFn() {
      const res = await apiRequest('GET', '/api/vinyl-materials');
      if (!res.ok) throw new Error('Failed to fetch vinyl materials');
      return (await res.json()) as VinylMaterial[];
    }
  });

  // Use default material if none selected and default exists
  useEffect(() => {
    if (!selectedMaterialId && vinylMaterials && vinylMaterials.length > 0) {
      const defaultMaterial = vinylMaterials.find(material => material.default);
      if (defaultMaterial) {
        onMaterialSelected(defaultMaterial.id);
      } else if (vinylMaterials.length > 0) {
        // Just use the first material if no default
        const firstMaterial = vinylMaterials[0];
        onMaterialSelected(firstMaterial.id);
      }
    }
  }, [vinylMaterials, selectedMaterialId, onMaterialSelected]);

  // Group materials by type
  const indoorMaterials = vinylMaterials?.filter(material => material.type?.toLowerCase() === 'indoor') || [];
  const outdoorMaterials = vinylMaterials?.filter(material => material.type?.toLowerCase() === 'outdoor') || [];
  const specialtyMaterials = vinylMaterials?.filter(material => material.type?.toLowerCase() === 'specialty') || [];
  const popularMaterials = vinylMaterials?.filter(material => material.default) || 
    [...indoorMaterials, ...outdoorMaterials].slice(0, 4);

  const handleMaterialSelect = (material: VinylMaterial) => {
    onMaterialSelected(material.id);
  };

  const getSelectedMaterial = () => {
    if (!vinylMaterials) return null;
    return vinylMaterials.find(material => material.id === selectedMaterialId);
  };

  const getDurabilityLabel = (durability: string | null) => {
    if (!durability) return null;
    
    switch (durability.toLowerCase()) {
      case 'low':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High</Badge>;
      default:
        return <Badge variant="outline">{durability}</Badge>;
    }
  };

  const getMaterialTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'indoor':
        return <Square className="h-4 w-4 mr-2" />;
      case 'outdoor':
        return <Layers className="h-4 w-4 mr-2" />;
      case 'specialty':
        return <SquareAsterisk className="h-4 w-4 mr-2" />;
      default:
        return <Star className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div className="vinyl-material-selector">
      <Tabs defaultValue="popular" value={materialCategory} onValueChange={setMaterialCategory}>
        <TabsList className="mb-4">
          <TabsTrigger value="popular" className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="indoor" className="flex items-center">
            <Tag className="mr-2 h-4 w-4" />
            Indoor
          </TabsTrigger>
          <TabsTrigger value="outdoor" className="flex items-center">
            <Layers className="mr-2 h-4 w-4" />
            Outdoor
          </TabsTrigger>
          <TabsTrigger value="specialty" className="flex items-center">
            <SquareAsterisk className="mr-2 h-4 w-4" />
            Specialty
          </TabsTrigger>
        </TabsList>

        <div className="material-options">
          <TabsContent value="popular">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedMaterialId?.toString() || undefined} 
                onValueChange={(value) => {
                  const materialId = parseInt(value);
                  const material = vinylMaterials?.find(m => m.id === materialId);
                  if (material) {
                    handleMaterialSelect(material);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && popularMaterials.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No popular materials available
                    </div>
                  )}
                  
                  {popularMaterials.map((material) => (
                    <div key={material.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={material.id.toString()} 
                        id={`material-${material.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`material-${material.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {material.name}
                          {material.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="flex items-center mr-2">
                            {getMaterialTypeIcon(material.type)}
                            {material.type}
                          </span>
                          {material.durability && (
                            <span className="ml-2">
                              Durability: {getDurabilityLabel(material.durability)}
                            </span>
                          )}
                        </div>
                        {material.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="indoor">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedMaterialId?.toString() || undefined} 
                onValueChange={(value) => {
                  const materialId = parseInt(value);
                  const material = vinylMaterials?.find(m => m.id === materialId);
                  if (material) {
                    handleMaterialSelect(material);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && indoorMaterials.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No indoor materials available
                    </div>
                  )}
                  
                  {indoorMaterials.map((material) => (
                    <div key={material.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={material.id.toString()} 
                        id={`material-${material.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`material-${material.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {material.name}
                          {material.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {material.durability && (
                            <span>
                              Durability: {getDurabilityLabel(material.durability)}
                            </span>
                          )}
                        </div>
                        {material.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="outdoor">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedMaterialId?.toString() || undefined} 
                onValueChange={(value) => {
                  const materialId = parseInt(value);
                  const material = vinylMaterials?.find(m => m.id === materialId);
                  if (material) {
                    handleMaterialSelect(material);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && outdoorMaterials.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No outdoor materials available
                    </div>
                  )}
                  
                  {outdoorMaterials.map((material) => (
                    <div key={material.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={material.id.toString()} 
                        id={`material-${material.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`material-${material.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {material.name}
                          {material.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {material.durability && (
                            <span>
                              Durability: {getDurabilityLabel(material.durability)}
                            </span>
                          )}
                        </div>
                        {material.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="specialty">
            <ScrollArea className="h-[300px] pr-4">
              <RadioGroup 
                value={selectedMaterialId?.toString() || undefined} 
                onValueChange={(value) => {
                  const materialId = parseInt(value);
                  const material = vinylMaterials?.find(m => m.id === materialId);
                  if (material) {
                    handleMaterialSelect(material);
                  }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoading && (
                    <div className="col-span-full flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}
                  
                  {!isLoading && specialtyMaterials.length === 0 && (
                    <div className="col-span-full text-center p-8 text-muted-foreground">
                      No specialty materials available
                    </div>
                  )}
                  
                  {specialtyMaterials.map((material) => (
                    <div key={material.id} className="flex items-start space-x-2">
                      <RadioGroupItem 
                        value={material.id.toString()} 
                        id={`material-${material.id}`} 
                        className="mt-1"
                      />
                      <div className="flex-grow">
                        <Label 
                          htmlFor={`material-${material.id}`} 
                          className="text-base font-medium flex items-center cursor-pointer"
                        >
                          {material.name}
                          {material.default && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              Default
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center text-sm text-muted-foreground">
                          {material.durability && (
                            <span>
                              Durability: {getDurabilityLabel(material.durability)}
                            </span>
                          )}
                        </div>
                        {material.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>

      {selectedMaterialId && (
        <div className="mt-4 p-3 border border-primary/20 bg-primary/5 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Selected Material</h4>
              <p className="text-sm text-muted-foreground">
                {getSelectedMaterial()?.name} 
                {getSelectedMaterial()?.durability && (
                  <span className="ml-2">
                    (Durability: {getSelectedMaterial()?.durability})
                  </span>
                )}
              </p>
              {getSelectedMaterial()?.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {getSelectedMaterial()?.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
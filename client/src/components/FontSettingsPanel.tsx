import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Check } from "lucide-react";

interface FontSet {
  id: string;
  name: string;
  description: string;
  count: number;
}

interface FontSettingsPanelProps {
  onFontSetSelected: (fontSet: string) => void;
  currentFontSet: string;
}

export default function FontSettingsPanel({
  onFontSetSelected,
  currentFontSet = "all"
}: FontSettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(currentFontSet);
  
  const fontSets: FontSet[] = [
    {
      id: "all",
      name: "All Fonts",
      description: "Load top 1000 most popular Google Fonts",
      count: 1000
    },
    {
      id: "popular",
      name: "Popular Only",
      description: "Just the most commonly used fonts (Roboto, Open Sans, etc)",
      count: 12
    },
    {
      id: "display",
      name: "Display Fonts",
      description: "Attention-grabbing fonts perfect for headings and titles",
      count: 10
    },
    {
      id: "handwriting",
      name: "Handwriting",
      description: "Cursive and script fonts that mimic handwritten text",
      count: 10
    },
    {
      id: "monospace",
      name: "Monospace",
      description: "Fixed-width fonts great for code and technical content",
      count: 10
    }
  ];
  
  const handleSubmit = () => {
    onFontSetSelected(selectedSet);
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Font Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Font Loading Settings</DialogTitle>
          <DialogDescription>
            Choose which fonts to load. Loading fewer fonts will improve performance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={selectedSet} 
            onValueChange={setSelectedSet}
            className="space-y-3"
          >
            {fontSets.map((set) => (
              <div
                key={set.id}
                className={`flex items-start space-x-3 border p-3 rounded-md transition-colors ${
                  selectedSet === set.id ? "border-primary bg-primary/5" : ""
                }`}
              >
                <RadioGroupItem value={set.id} id={`set-${set.id}`} className="mt-1" />
                <div className="flex-1">
                  <Label 
                    htmlFor={`set-${set.id}`}
                    className="font-medium block"
                  >
                    {set.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{set.description}</p>
                  <div className="mt-1 text-xs">
                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5">
                      {set.count} fonts
                    </span>
                  </div>
                </div>
                {selectedSet === set.id && (
                  <div className="text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            Apply Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
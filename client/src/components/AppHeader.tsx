import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppHeaderProps {
  currentDesignName: string;
  setCurrentDesignName: (name: string) => void;
  exportDesign: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  saveDesign: () => void;
  canvasState: string | null;
}

export default function AppHeader({ 
  currentDesignName, 
  setCurrentDesignName, 
  exportDesign,
  theme,
  setTheme,
  saveDesign,
  canvasState
}: AppHeaderProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleExport = () => {
    exportDesign();
    toast({
      title: "Design exported",
      description: "Your design has been exported successfully.",
    });
  };

  const handleSave = async () => {
    if (!canvasState) {
      toast({
        title: "Nothing to save",
        description: "Add some elements to your design first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await saveDesign();
      toast({
        title: "Design saved",
        description: "Your design has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save your design. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-800 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
          </svg>
          <h1 className="text-xl font-bold font-sans text-primary">VinylStudio</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="px-3 py-1 text-sm bg-primary hover:bg-primary/90 text-white rounded transition-colors"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Design"}
          </button>
          
          <button 
            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            onClick={handleExport}
          >
            Export Design
          </button>
          
          <div className="border rounded-md p-1.5 bg-background">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </div>
    </header>
  );
}

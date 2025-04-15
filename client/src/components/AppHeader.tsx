import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Design } from "@/types/vinyl";

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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

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
    <header className="bg-white dark:bg-neutral-darkest shadow-sm border-b border-neutral-200 dark:border-neutral-800 py-2 px-4">
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
          
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-light dark:bg-neutral-darkest"
            onClick={toggleTheme}
          >
            <svg className="w-5 h-5 block dark:hidden" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
            </svg>
            <svg className="w-5 h-5 hidden dark:block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

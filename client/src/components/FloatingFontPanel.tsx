import React, { useState } from "react";
import { 
  TypeIcon, PaintBucket, Layers, Settings, Image, TextIcon, Wand2,
  ChevronLeft, ChevronRight, Search, Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import LocalFontPreviewer from '@/components/LocalFontPreviewer';
import FontComparison from '@/components/FontComparison';
import FontGallery from '@/components/FontGallery';

interface FloatingFontPanelProps {
  onFontSelected: (fontFamily: string) => void;
  currentFont?: string;
}

export default function FloatingFontPanel({
  onFontSelected,
  currentFont
}: FloatingFontPanelProps) {
  // States for navigation and panel control
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<string>("fonts");
  const [activeFontTab, setActiveFontTab] = useState<string>("local");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Toggle expanded/collapsed state
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Main navigation tabs
  const mainTabs = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "fonts", label: "Fonts", icon: <TypeIcon className="w-5 h-5" /> },
    { id: "colors", label: "Colors", icon: <PaintBucket className="w-5 h-5" /> },
    { id: "layers", label: "Layers", icon: <Layers className="w-5 h-5" /> },
    { id: "images", label: "Images", icon: <Image className="w-5 h-5" /> },
    { id: "text", label: "Text", icon: <TextIcon className="w-5 h-5" /> },
    { id: "effects", label: "Effects", icon: <Wand2 className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed right-0 top-[60px] bottom-0 flex h-[calc(100vh-60px)] z-40">
      {/* Main Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 py-2">
        <div className="flex flex-col items-center space-y-1">
          {mainTabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeMainTab === tab.id ? "secondary" : "ghost"}
              size="icon"
              className={cn(
                "w-10 h-10 rounded-lg",
                activeMainTab === tab.id && "bg-gray-100 dark:bg-gray-700"
              )}
              onClick={() => setActiveMainTab(tab.id)}
              title={tab.label}
            >
              {tab.icon}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Collapsible Toggle Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-4 h-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-md z-50"
        >
          {isExpanded ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </div>
      
      {/* Content Panel based on active main tab */}
      {isExpanded && (
        <div className={`bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-[350px] transition-all duration-300 overflow-hidden flex flex-col`}>
          {/* Panel Header - changes based on active tab */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-3">
            <h2 className="text-lg font-medium">{mainTabs.find(t => t.id === activeMainTab)?.label}</h2>
            {activeMainTab === "fonts" && (
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search fonts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
          
          {/* Panel Content - changes based on active tab */}
          <div className="flex-1 overflow-auto">
            {activeMainTab === "fonts" && (
              <Tabs 
                defaultValue={activeFontTab} 
                onValueChange={setActiveFontTab} 
                className="w-full h-full"
              >
                <div className="px-4 pt-3">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="local">Local</TabsTrigger>
                    <TabsTrigger value="google">Google</TabsTrigger>
                    <TabsTrigger value="compare">Compare</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="p-4 h-[calc(100%-60px)]">
                  <TabsContent value="local" className="h-full mt-0 overflow-auto">
                    <LocalFontPreviewer 
                      onFontSelected={onFontSelected}
                      currentFont={currentFont}
                      previewText="Aa Bb Cc 123"
                    />
                  </TabsContent>
                  
                  <TabsContent value="google" className="h-full mt-0 overflow-auto">
                    <FontGallery 
                      currentFont={currentFont || "Roboto"}
                      onFontSelected={onFontSelected}
                      sampleText="Aa Bb Cc 123"
                      visible={activeFontTab === "google"}
                    />
                  </TabsContent>
                  
                  <TabsContent value="compare" className="h-full mt-0 overflow-auto">
                    <FontComparison 
                      currentFont={currentFont} 
                      onFontSelected={onFontSelected}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            )}
            
            {activeMainTab === "home" && (
              <div className="p-4">
                <h3 className="font-medium mb-2">Welcome!</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select the Fonts tab to choose from local or Google fonts for your design.
                </p>
              </div>
            )}
            
            {activeMainTab === "colors" && (
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Color tools will appear here. Select a text object first.
                </p>
              </div>
            )}
            
            {(activeMainTab !== "fonts" && activeMainTab !== "home" && activeMainTab !== "colors") && (
              <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mainTabs.find(t => t.id === activeMainTab)?.label} tools will appear here.
                </p>
              </div>
            )}
          </div>
          
          {/* Display current selection information */}
          {activeMainTab === "fonts" && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {currentFont ? (
                  <>Current font: <span className="font-medium">{currentFont}</span></>
                ) : (
                  "Select text to apply a font"
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
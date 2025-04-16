import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  const [activeFontTab, setActiveFontTab] = useState<string>("local");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Toggle expanded/collapsed state
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="fixed right-0 top-[60px] bottom-0 flex h-[calc(100vh-60px)] z-40">      
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
      
      {/* Content Panel */}
      {isExpanded && (
        <div className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-[350px] transition-all duration-300 overflow-hidden flex flex-col">
          {/* Panel Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-3">
            <h2 className="text-lg font-medium">Fonts</h2>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fonts..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Panel Content */}
          <div className="flex-1 overflow-auto">
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
          </div>
          
          {/* Display current selection information */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {currentFont ? (
                <>Current font: <span className="font-medium">{currentFont}</span></>
              ) : (
                "Select text to apply a font"
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
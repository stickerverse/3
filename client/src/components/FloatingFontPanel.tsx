import React, { useState, useRef, useEffect } from "react";
import { X, Minimize2, Maximize2, PanelLeft, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LocalFontPreviewer from '@/components/LocalFontPreviewer';
import FontComparison from '@/components/FontComparison';
import FontGallery from '@/components/FontGallery';
import SystemFontBrowser from '@/components/SystemFontBrowser';

interface FloatingFontPanelProps {
  onFontSelected: (fontFamily: string) => void;
  currentFont?: string;
}

export default function FloatingFontPanel({
  onFontSelected,
  currentFont
}: FloatingFontPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 60 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState("local");
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Toggle between docked and floating modes
  const toggleDock = () => {
    setIsDocked(!isDocked);
    // When undocking, position the panel in a sensible location
    if (isDocked) {
      setPosition({ x: 20, y: 60 });
    }
  };
  
  // Minimize/Expand the panel
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Handle the start of dragging
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDocked) return;
    
    setDragging(true);
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };
  
  // Handle dragging motion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging && !isDocked) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
    
    const handleMouseUp = () => {
      setDragging(false);
    };
    
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragOffset, isDocked]);

  return (
    <div 
      ref={panelRef}
      className={`
        ${isDocked 
          ? "fixed right-0 top-[60px] bottom-0 w-[280px] border-l border-gray-200 dark:border-gray-800" 
          : "fixed shadow-lg rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden"}
        ${dragging ? "pointer-events-none" : ""}
        bg-gray-50 dark:bg-gray-900 z-40 transition-all
      `}
      style={!isDocked ? {
        width: isExpanded ? "280px" : "auto",
        height: isExpanded ? "450px" : "auto",
        top: `${position.y}px`,
        left: `${position.x}px`,
      } : {}}
    >
      {/* Panel Header */}
      <div 
        className="bg-white dark:bg-gray-800 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="text-sm font-medium flex items-center">
          <span className="ml-1">Font Selector</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleDock}
          >
            {isDocked ? <PanelLeft className="h-3.5 w-3.5" /> : <AlignJustify className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleExpand}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      
      {/* Panel Content */}
      {isExpanded && (
        <div className="p-2 h-[calc(100%-40px)] overflow-auto">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="local">Local</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>
            
            <TabsContent value="local" className="h-[calc(100%-40px)] overflow-auto">
              <LocalFontPreviewer 
                onFontSelected={onFontSelected}
                currentFont={currentFont}
                previewText="Aa Bb Cc 123"
              />
            </TabsContent>
            
            <TabsContent value="google" className="h-[calc(100%-40px)] overflow-auto">
              <FontGallery 
                currentFont={currentFont || "Roboto"}
                onFontSelected={onFontSelected}
                sampleText="Aa Bb Cc 123"
                visible={activeTab === "google"}
              />
            </TabsContent>
            
            <TabsContent value="compare" className="h-[calc(100%-40px)] overflow-auto">
              <FontComparison 
                currentFont={currentFont} 
                onFontSelected={onFontSelected}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
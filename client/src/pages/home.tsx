import { useEffect } from "react";
import useVinylDesigner from "@/hooks/useVinylDesigner";
import AppHeader from "@/components/AppHeader";
import Toolbar from "@/components/Toolbar";
import DesignWorkspace from "@/components/DesignWorkspace";
import PropertiesPanel from "@/components/PropertiesPanel";
import LayersPanel from "@/components/LayersPanel";
import TemplateSelector from "@/components/TemplateSelector";
import TutorialOverlay from "@/components/TutorialOverlay";
import VinylPropertiesDialog from "@/components/VinylPropertiesDialog";
import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  const vinylDesigner = useVinylDesigner();
  
  useEffect(() => {
    // Check if the user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      vinylDesigner.setTheme("dark");
      document.documentElement.classList.add("dark");
    }
    
    // Listen for changes in the color scheme preference
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      vinylDesigner.setTheme(e.matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader 
        currentDesignName={vinylDesigner.currentDesignName}
        setCurrentDesignName={vinylDesigner.setCurrentDesignName}
        exportDesign={vinylDesigner.exportDesign}
        theme={vinylDesigner.theme}
        setTheme={vinylDesigner.setTheme}
        saveDesign={vinylDesigner.saveDesign}
        canvasState={vinylDesigner.canvasState}
      />

      <main className="flex-1 flex flex-col md:flex-row">
        <Toolbar 
          addText={vinylDesigner.addText}
          addShape={vinylDesigner.addShape}
          addImage={vinylDesigner.addImage}
          toggleTemplates={vinylDesigner.toggleTemplates}
          toggleLayers={vinylDesigner.toggleLayers}
          toggleSettings={vinylDesigner.toggleSettings}
          selectedTool={vinylDesigner.selectedTool}
          showToolTips={vinylDesigner.showToolTips}
          currentFont={vinylDesigner.font}
          onSelectFont={vinylDesigner.setFont}
        />

        <DesignWorkspace 
          canvasRef={vinylDesigner.canvasRef}
          undo={vinylDesigner.undo}
          redo={vinylDesigner.redo}
          zoom={vinylDesigner.zoom}
          setZoom={vinylDesigner.setZoom}
          view={vinylDesigner.view}
          setView={vinylDesigner.setView}
          currentDesignName={vinylDesigner.currentDesignName}
          setCurrentDesignName={vinylDesigner.setCurrentDesignName}
          selectedObj={vinylDesigner.selectedObj}
          canvas={vinylDesigner.canvas}
          toggleTutorial={vinylDesigner.toggleTutorial}
          toggleVinylProperties={vinylDesigner.toggleVinylProperties}
          dimensions={vinylDesigner.dimensions}
          selectedSizeId={vinylDesigner.selectedSizeId}
          selectedMaterialId={vinylDesigner.selectedMaterialId}
        />

        <PropertiesPanel 
          selectedObj={vinylDesigner.selectedObj}
          text={vinylDesigner.text}
          setText={vinylDesigner.setText}
          font={vinylDesigner.font}
          setFont={vinylDesigner.setFont}
          fontSize={vinylDesigner.fontSize}
          setFontSize={vinylDesigner.setFontSize}
          color={vinylDesigner.color}
          setColor={vinylDesigner.setColor}
          opacity={vinylDesigner.opacity}
          setOpacity={vinylDesigner.setOpacity}
          strokeColor={vinylDesigner.strokeColor}
          setStrokeColor={vinylDesigner.setStrokeColor}
          strokeWidth={vinylDesigner.strokeWidth}
          setStrokeWidth={vinylDesigner.setStrokeWidth}
          textEffect={vinylDesigner.textEffect}
          setTextEffect={vinylDesigner.setTextEffect}
          showFontPanel={vinylDesigner.showFontPanel}
          setShowFontPanel={vinylDesigner.setShowFontPanel}
          addText={vinylDesigner.addText}
          deleteSelectedObject={vinylDesigner.deleteSelectedObject}
          duplicateSelectedObject={vinylDesigner.duplicateSelectedObject}
          fontCategories={vinylDesigner.fontCategories}
          applyTextEffect={vinylDesigner.applyTextEffect}
          canvas={vinylDesigner.canvas}
        />
      </main>

      <LayersPanel 
        layers={vinylDesigner.layers}
        showLayersPanel={vinylDesigner.showLayersPanel}
        setShowLayersPanel={vinylDesigner.setShowLayersPanel}
        canvas={vinylDesigner.canvas}
        selectObject={vinylDesigner.selectObject}
      />

      <TemplateSelector 
        designTemplates={vinylDesigner.designTemplates}
        showTemplates={vinylDesigner.showTemplates}
        setShowTemplates={vinylDesigner.setShowTemplates}
        applyTemplate={vinylDesigner.applyTemplate}
      />

      <TutorialOverlay 
        showTutorial={vinylDesigner.showTutorial}
        setShowTutorial={vinylDesigner.setShowTutorial}
      />

      <VinylPropertiesDialog
        isOpen={vinylDesigner.showVinylProperties}
        onClose={() => vinylDesigner.setShowVinylProperties(false)}
        initialSizeId={vinylDesigner.selectedSizeId}
        initialMaterialId={vinylDesigner.selectedMaterialId}
        initialDimensions={vinylDesigner.dimensions}
        onSave={vinylDesigner.saveVinylProperties}
      />

      <ImageUploader
        isOpen={vinylDesigner.showImageUploader}
        onClose={() => vinylDesigner.setShowImageUploader(false)}
        onImageSelected={vinylDesigner.handleImageSelected}
      />
    </div>
  );
}

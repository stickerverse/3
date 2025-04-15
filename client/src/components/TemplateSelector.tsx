import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DesignTemplate } from "@/types/vinyl";

interface TemplateSelectorProps {
  designTemplates: DesignTemplate[];
  showTemplates: boolean;
  setShowTemplates: (show: boolean) => void;
  applyTemplate: (template: DesignTemplate) => void;
}

export default function TemplateSelector({
  designTemplates,
  showTemplates,
  setShowTemplates,
  applyTemplate
}: TemplateSelectorProps) {

  const handleClose = () => {
    setShowTemplates(false);
  };

  return (
    <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Design Templates</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {designTemplates.map((template, index) => (
            <div 
              key={index}
              className="border border-neutral-200 dark:border-neutral-700 rounded overflow-hidden hover:border-primary hover:shadow-md dark:hover:border-primary transition-colors cursor-pointer"
              onClick={() => applyTemplate(template)}
            >
              <div 
                className="h-32 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-2"
                style={{ backgroundColor: template.bgColor || '#f1f5f9' }}
              >
                <div style={{ 
                  fontFamily: template.font, 
                  fontSize: Math.min(template.fontSize / 2, 28), 
                  color: template.color,
                  textShadow: template.effect === 'shadow' ? '2px 2px 3px rgba(0,0,0,0.3)' : 'none',
                  WebkitTextStroke: template.effect === 'outline' ? `${Math.min(template.strokeWidth, 1)}px ${template.strokeColor || '#000'}` : 'none'
                }}>
                  {template.name.toUpperCase()}
                </div>
              </div>
              <div className="p-2 text-sm border-t border-neutral-200 dark:border-neutral-700">
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {template.font}, {template.fontSize}pt, {template.colorName || "Custom"}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface TutorialOverlayProps {
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
}

export default function TutorialOverlay({
  showTutorial,
  setShowTutorial
}: TutorialOverlayProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    setShowTutorial(false);
    
    if (dontShowAgain) {
      localStorage.setItem('vinyl-studio-tutorial-hidden', 'true');
    }
  };

  const handleStartDesigning = () => {
    setShowTutorial(false);
  };

  return (
    <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Welcome to VinylStudio!</DialogTitle>
        </DialogHeader>
        
        <div className="text-sm space-y-3 mb-6">
          <p>This tutorial will show you how to create your first vinyl design in just a few steps.</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click the <strong>Text</strong> button in the left toolbar to add text to your design.</li>
            <li>Use the properties panel on the right to customize your text's font, size, and color.</li>
            <li>Apply special effects like shadows, outlines, or glows to make your design stand out.</li>
            <li>Use the layers panel to organize multiple elements in your design.</li>
            <li>When you're done, click <strong>Export Design</strong> to save your creation!</li>
          </ol>
        </div>
        
        <DialogFooter className="flex justify-between items-center sm:justify-between">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="dontShowAgain" 
              className="mr-2" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            <label htmlFor="dontShowAgain" className="text-sm text-neutral-600 dark:text-neutral-300">
              Don't show again
            </label>
          </div>
          <Button onClick={handleStartDesigning}>
            Got it, let's design!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

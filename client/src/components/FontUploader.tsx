import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload } from 'lucide-react';
import LocalFontUploader from './LocalFontUploader';

interface FontUploaderProps {
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFontUploaded?: (font: { family: string, fileName: string, url: string }) => void;
}

export default function FontUploader({
  showUploader,
  setShowUploader,
  onFontUploaded
}: FontUploaderProps) {
  const handleClose = () => {
    setShowUploader(false);
  };

  const handleFontUploaded = (font: { family: string, url: string }) => {
    if (onFontUploaded) {
      onFontUploaded({
        family: font.family,
        fileName: font.family,
        url: font.url
      });
    }
    
    // Auto-close after successful upload (with a slight delay)
    setTimeout(() => {
      setShowUploader(false);
    }, 1500);
  };

  return (
    <Dialog open={showUploader} onOpenChange={setShowUploader}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Custom Font</DialogTitle>
          <DialogDescription>
            Upload your own font files to use in your designs
          </DialogDescription>
        </DialogHeader>
        
        <LocalFontUploader
          onFontUploaded={handleFontUploaded}
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
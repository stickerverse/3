
import React, { useEffect, useRef } from 'react';

interface StandaloneFontPreviewerProps {
  onFontSelected?: (fontFamily: string) => void;
}

const StandaloneFontPreviewer: React.FC<StandaloneFontPreviewerProps> = ({ 
  onFontSelected 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    // Handle messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'FONT_SELECTED') {
        onFontSelected?.(event.data.fontFamily);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onFontSelected]);

  return (
    <div className="w-full h-full border border-border rounded-md overflow-hidden">
      <iframe 
        ref={iframeRef}
        src="/standalone-font-previewer" 
        className="w-full h-[600px]"
        title="Font Previewer"
        loading="eager"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
};

export default StandaloneFontPreviewer;

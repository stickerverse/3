import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolbarProps {
  addText: () => void;
  addShape: () => void;
  addImage: () => void;
  toggleTemplates: () => void;
  toggleLayers: () => void;
  toggleSettings: () => void;
  selectedTool: string | null;
  showToolTips: boolean;
}

export default function Toolbar({
  addText,
  addShape,
  addImage,
  toggleTemplates,
  toggleLayers,
  toggleSettings,
  selectedTool,
  showToolTips
}: ToolbarProps) {

  const ToolButton = ({ 
    onClick, 
    label, 
    icon, 
    active = false 
  }: { 
    onClick: () => void; 
    label: string; 
    icon: React.ReactNode; 
    active?: boolean 
  }) => {
    const button = (
      <button
        className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg ${
          active 
            ? "bg-primary-light/10 text-primary hover:bg-primary-light/20" 
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        } transition-colors mb-1`}
        onClick={onClick}
        aria-label={label}
      >
        {icon}
      </button>
    );

    if (!showToolTips) return button;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="w-full md:w-16 md:min-h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex md:flex-col justify-around p-2 md:py-4">
      <ToolButton
        onClick={addText}
        label="Add Text"
        active={selectedTool === "text"}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 4v3h5.5v12h3V7H19V4z" />
          </svg>
        }
      />
      
      <ToolButton
        onClick={addShape}
        label="Add Shape"
        active={selectedTool === "shape"}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 12l8 10 8-10L12 2zm0 3.1l5.5 6.9L12 17.1 6.5 12 12 5.1z" />
          </svg>
        }
      />
      
      <ToolButton
        onClick={addImage}
        label="Add Image"
        active={selectedTool === "image"}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        }
      />
      
      <ToolButton
        onClick={toggleTemplates}
        label="Templates"
        active={selectedTool === "templates"}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z" />
          </svg>
        }
      />
      
      <div className="flex-grow"></div>
      
      <ToolButton
        onClick={toggleLayers}
        label="Toggle Layers"
        active={selectedTool === "layers"}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
          </svg>
        }
      />

      <ToolButton
        onClick={toggleSettings}
        label="Settings"
        active={selectedTool === "settings"}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
          </svg>
        }
      />
    </div>
  );
}
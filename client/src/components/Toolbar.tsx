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
  showFontShowcase: boolean; // Added prop
  setShowFontShowcase: (show: boolean) => void; // Added prop
  handleSelectFont: (font: string) => void; // Added prop
  currentFont: string; // Added prop
}

export default function Toolbar({
  addText,
  addShape,
  addImage,
  toggleTemplates,
  toggleLayers,
  toggleSettings,
  selectedTool,
  showToolTips,
  showFontShowcase,
  setShowFontShowcase,
  handleSelectFont,
  currentFont
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
        onClick={() => setShowFontShowcase(true)} // Added onClick handler
        label="Fonts"
        active={selectedTool === "fonts"} // Assuming "fonts" is a valid selectedTool value
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            {/* Replace with a font icon */}
            <path d="M12 2L4 12l8 10 8-10L12 2zm0 3.1l5.5 6.9L12 17.1 6.5 12 12 5.1z" />
          </svg>
        }
      />

    </div>

    {/* Font Showcase */}
    <FontShowcase 
      isOpen={showFontShowcase}
      onClose={() => setShowFontShowcase(false)}
      onSelectFont={handleSelectFont}
      currentFont={currentFont}
    />
  );
}
interface SystemFontBrowserProps {
  onClose?: () => void;
  onFontSelected?: (fontName: string) => void;
  currentFont?: string; // Add current font prop to highlight selected font
}

export default function SystemFontBrowser({ onClose, onFontSelected, currentFont }: SystemFontBrowserProps) {
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [previewText, setPreviewText] = useState('Aa Bb Cc');
  const [loadComplete, setLoadComplete] = useState(false);
  const [missingFontsFolder, setMissingFontsFolder] = useState(false);

  // Function to get the currently selected font from props
  const getCurrentSelectedFont = () => {
    return currentFont || '';
  };

  const filteredFonts = loadedFonts.filter(font =>
    font.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="w-96 bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">System Fonts</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <input
        type="text"
        placeholder="Filter fonts..."
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <div className="grid grid-cols-2 gap-2">
        {filteredFonts.map((fontName, index) => {
                // Check if this font is currently selected in the editor
                const isSelected = onFontSelected && fontName === getCurrentSelectedFont();

                return (
                  <div 
                    key={`system-browser-font-${index}-${fontName}`}
                    className={`bg-white dark:bg-neutral-800 border rounded-xl overflow-hidden shadow transition-all duration-200 cursor-pointer
                      ${isSelected 
                        ? 'border-primary shadow-md scale-105' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-primary/50 hover:scale-105'
                      }`}
                    onClick={async () => {
                      if (onFontSelected) {
                        // Try to load the font first before applying it
                        try {
                          // Create a temporary element to trigger font loading
                          const tempElement = document.createElement('div');
                          tempElement.style.fontFamily = fontName;
                          tempElement.style.visibility = 'hidden';
                          tempElement.textContent = previewText || "Aa Bb Cc";
                          document.body.appendChild(tempElement);

                          // Apply the font
                          onFontSelected(fontName);

                          // Clean up
                          setTimeout(() => {
                            document.body.removeChild(tempElement);
                          }, 100);
                        } catch (error) {
                          console.error('Error applying font:', error);
                          // Still try to apply even if there was an error
                          onFontSelected(fontName);
                        }
                      }
                    }}
                  >
                    <div
                      className="flex items-center justify-center h-20 p-2 bg-white dark:bg-neutral-800 overflow-hidden"
                      style={{ fontFamily: fontName }}
                    >
                      <span className="text-2xl">
                        {previewText || "Aa Bb Cc"}
                      </span>
                    </div>
                    <div className={`text-xs text-center p-1 border-t truncate font-medium 
                      ${isSelected 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'
                      }`}>
                      {fontName}
                    </div>
                  </div>
                );
              })
        }
      </div>
    </div>
  );
}
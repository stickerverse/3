import WebFont from 'webfontloader';

/**
 * Font Integration Service
 * Provides functionality to load and manage fonts in the application
 * Supports both Google Fonts and locally uploaded fonts
 */
class GoogleFontsService {
  // Default popular fonts to display initially
  popularFonts: string[] = [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 
    'Source Sans Pro', 'Raleway', 'Nunito', 'Playfair Display',
    'Merriweather', 'Poppins', 'Ubuntu', 'Roboto Condensed', 
    'Roboto Mono', 'Anton', 'Bebas Neue', 'Dancing Script', 'Pacifico'
  ];
  
  // Font categories for organization
  categories: Record<string, string[]> = {
    'local': [],     // New category for local fonts
    'serif': [],
    'sans-serif': [],
    'display': [],
    'handwriting': [],
    'monospace': []
  };
  
  // Cache for API responses
  fontCache: any = null;
  
  // Track loaded fonts to avoid reloading
  loadedFonts: Set<string> = new Set();
  
  // Map to store local font URLs
  localFontUrls: Map<string, string> = new Map();
  
  constructor() {
    // Load any local fonts from localStorage
    this.loadLocalFontsFromStorage();
    
    // Initialize with popular fonts
    this.init();
  }
  
  /**
   * Load any previously saved local fonts from localStorage
   */
  private loadLocalFontsFromStorage() {
    try {
      const savedFonts = localStorage.getItem('localFonts');
      if (savedFonts) {
        const fontData = JSON.parse(savedFonts);
        
        // Restore the local fonts category
        if (Array.isArray(fontData.fontNames)) {
          this.categories['local'] = fontData.fontNames;
        }
        
        // Restore the URL mapping
        if (fontData.urlMap) {
          for (const [fontName, url] of Object.entries(fontData.urlMap)) {
            this.localFontUrls.set(fontName, url as string);
          }
        }
        
        // Now load each font
        if (this.categories['local'].length > 0) {
          for (const fontName of this.categories['local']) {
            const url = this.localFontUrls.get(fontName);
            if (url) {
              try {
                // Create and load the font
                const fontFace = new FontFace(fontName, `url(${url})`);
                fontFace.load().then(loadedFace => {
                  document.fonts.add(loadedFace);
                  this.loadedFonts.add(fontName);
                }).catch(err => {
                  console.error(`Failed to load local font ${fontName}:`, err);
                });
              } catch (err) {
                console.error(`Error creating FontFace for ${fontName}:`, err);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading local fonts from storage:", error);
    }
  }
  
  /**
   * Initialize the font service
   * @param {string} fontSet - Optional font set to load (popular, display, etc.)
   */
  async init(fontSet?: string) {
    console.log("Initializing Google Fonts service");
    
    // Clear font cache if switching font sets
    if (fontSet) {
      this.fontCache = null;
      this.loadedFonts.clear();
      this.categories = {
        'serif': [],
        'sans-serif': [],
        'display': [],
        'handwriting': [],
        'monospace': []
      };
    }
    
    // Load popular fonts initially for better UX
    await this.loadFonts(this.popularFonts);
    console.log("Initial fonts loaded successfully");
    
    // Start loading all fonts (or specific font set) in the background
    this.fetchGoogleFonts(fontSet).then(data => {
      // Get all font families
      const allFonts = data.fonts.map((font: any) => font.family);
      // Load fonts in smaller batches to prevent timeout issues
      this.loadAllFontsInBatches(allFonts);
    }).catch(err => {
      console.error("Error loading all fonts:", err);
    });
  }
  
  /**
   * Load all fonts in smaller batches to prevent timeout issues
   * @param allFonts Array of all font families to load
   */
  async loadAllFontsInBatches(allFonts: string[]) {
    // Limit to 1000 fonts maximum for better performance
    const maxFonts = 1000;
    const limitedFonts = allFonts.length > maxFonts ? allFonts.slice(0, maxFonts) : allFonts;
    
    const batchSize = 15; // Load 15 fonts at a time
    const totalFonts = limitedFonts.length;
    let loadedCount = 0;
    
    // Process fonts in batches
    for (let i = 0; i < totalFonts; i += batchSize) {
      const batch = limitedFonts.slice(i, i + batchSize);
      try {
        await this.loadFonts(batch);
        loadedCount += batch.length;
        console.log(`Fonts loaded: ${loadedCount} of ${totalFonts} fonts`);
      } catch (error) {
        console.error(`Error loading font batch ${i}-${i + batchSize}:`, error);
      }
    }
    
    console.log(`All fonts loaded successfully (limited to ${totalFonts} fonts)`);
  }
  
  /**
   * Load specific font(s) using WebFontLoader
   * @param {string|Array<string>} fontFamilies - Font(s) to load
   * @returns {Promise} - Resolves when fonts are loaded
   */
  async loadFonts(fontFamilies: string | string[]): Promise<void> {
    if (!fontFamilies || 
        (Array.isArray(fontFamilies) && fontFamilies.length === 0)) {
      return Promise.resolve();
    }
    
    // Ensure array format
    const families = Array.isArray(fontFamilies) ? fontFamilies : [fontFamilies];
    
    // Filter out already loaded fonts
    const fontsToLoad = families.filter(font => !this.loadedFonts.has(font));
    
    if (fontsToLoad.length === 0) {
      return Promise.resolve();
    }
    
    // Load fonts in smaller batches to improve reliability
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < fontsToLoad.length; i += batchSize) {
      const batch = fontsToLoad.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    // Process each batch sequentially
    for (const batch of batches) {
      await this.loadFontBatch(batch);
    }
    
    return Promise.resolve();
  }
  
  /**
   * Helper method to load a batch of fonts
   * @param fontBatch Array of font names to load in one batch
   */
  private loadFontBatch(fontBatch: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create link elements manually for each font
      const links: HTMLLinkElement[] = [];
      
      // First, create link elements to preload fonts
      fontBatch.forEach(fontFamily => {
        // Sanitize the font name for the URL
        const encodedFont = fontFamily.replace(/ /g, '+');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        links.push(link);
      });
      
      // Then use WebFont loader as a backup
      WebFont.load({
        google: {
          families: fontBatch.map(font => `${font}:400,700,italic`)
        },
        classes: false,    // Don't append classes
        events: false,     // Don't trigger events 
        active: () => {
          // Mark these fonts as loaded
          fontBatch.forEach(font => this.loadedFonts.add(font));
          console.log("Fonts loaded:", fontBatch.length, "fonts");
          resolve();
        },
        inactive: () => {
          // Still mark as loaded to avoid blocking UI even if WebFont considers it inactive
          fontBatch.forEach(font => this.loadedFonts.add(font));
          console.warn('WebFont loader inactive for:', fontBatch);
          resolve(); // Resolve instead of reject to avoid blocking UI
        },
        timeout: 3000 // 3 second timeout is enough since we already added stylesheets
      });
    });
  }
  
  /**
   * Check if a font is already loaded
   * @param {string} fontFamily - Font to check
   * @returns {boolean} - True if font is loaded
   */
  isFontLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily);
  }
  
  /**
   * Fetch Google Fonts data from the API
   * @param {string} fontSet - Optional font set to filter by (popular, display, etc.)
   * @returns {Promise} - Resolves with font data
   */
  async fetchGoogleFonts(fontSet?: string) {
    // Return cached data if available and no specific font set requested
    if (this.fontCache && !fontSet) {
      return this.fontCache;
    }
    
    try {
      // Build URL with query parameters if needed
      let url = '/api/fonts';
      if (fontSet) {
        url += `?fontSet=${fontSet}`;
      }
      
      // In our application, we have a real API endpoint
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch fonts from API');
      }
      
      const data = await response.json();
      
      // Organize fonts by category
      data.fonts.forEach((font: any) => {
        const category = font.category || 'sans-serif';
        if (this.categories[category]) {
          this.categories[category].push(font.family);
        } else {
          this.categories[category] = [font.family];
        }
      });
      
      // Cache the response
      this.fontCache = {
        fonts: data.fonts,
        categories: this.categories,
        total: data.fonts.length
      };
      
      return this.fontCache;
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      
      // Fallback to mock data if API fails
      console.warn('Using fallback font data');
      const fontData = this.getMockFontData();
      
      // Organize fonts by category
      fontData.items.forEach((font: any) => {
        const category = font.category || 'sans-serif';
        if (this.categories[category]) {
          this.categories[category].push(font.family);
        } else {
          this.categories[category] = [font.family];
        }
      });
      
      // Cache the response
      this.fontCache = {
        fonts: fontData.items,
        categories: this.categories,
        total: fontData.items.length
      };
      
      return this.fontCache;
    }
  }
  
  /**
   * Mock font data for the integration example
   * In a real implementation, this would come from the API
   */
  getMockFontData() {
    return {
      kind: "webfonts#webfontList",
      items: [
        // Sample subset of Google Fonts with their metadata
        { family: "Roboto", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Open Sans", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Lato", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Montserrat", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Oswald", category: "sans-serif", variants: ["regular", "700"] },
        { family: "Source Sans Pro", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Raleway", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Nunito", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Playfair Display", category: "serif", variants: ["regular", "italic", "700"] },
        { family: "Merriweather", category: "serif", variants: ["regular", "italic", "700"] },
        { family: "Lora", category: "serif", variants: ["regular", "italic", "700"] },
        { family: "Roboto Slab", category: "serif", variants: ["regular", "700"] },
        { family: "Poppins", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Ubuntu", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Roboto Condensed", category: "sans-serif", variants: ["regular", "italic", "700"] },
        { family: "Roboto Mono", category: "monospace", variants: ["regular", "italic", "700"] },
        { family: "Source Code Pro", category: "monospace", variants: ["regular", "700"] },
        { family: "Fira Mono", category: "monospace", variants: ["regular", "500", "700"] },
        { family: "Anton", category: "display", variants: ["regular"] },
        { family: "Bebas Neue", category: "display", variants: ["regular"] },
        { family: "Archivo Black", category: "display", variants: ["regular"] },
        { family: "Dancing Script", category: "handwriting", variants: ["regular", "700"] },
        { family: "Pacifico", category: "handwriting", variants: ["regular"] },
        { family: "Caveat", category: "handwriting", variants: ["regular", "700"] }
      ]
    };
  }
  
  /**
   * Get sample fonts from each category
   * @param {number} count - Number of fonts to get from each category
   * @returns {Array} - Array of font families
   */
  async getFontSamples(count = 2) {
    const data = await this.fetchGoogleFonts();
    const samples: string[] = [];
    
    Object.values(this.categories).forEach(fonts => {
      // If there are fonts in this category
      if (fonts && fonts.length > 0) {
        // Sort randomly and take the requested number of samples
        const randomFonts = [...fonts].sort(() => 0.5 - Math.random()).slice(0, count);
        samples.push(...randomFonts);
      }
    });
    
    return samples;
  }
  
  /**
   * Get all available fonts as a flat array
   */
  async getAllFonts() {
    const data = await this.fetchGoogleFonts();
    return data.fonts.map((font: any) => font.family);
  }
  
  /**
   * Get fonts by category
   * @param {string} category - Category name
   * @returns {Array} - Array of font families in the category
   */
  async getFontsByCategory(category: string) {
    await this.fetchGoogleFonts();
    return this.categories[category] || [];
  }

  /**
   * Register a locally uploaded font
   * @param fontName The name/family of the font
   * @param url The object URL or data URL of the font file
   * @returns True if registration was successful
   */
  registerLocalFont(fontName: string, url: string): boolean {
    try {
      // Add to local fonts category
      if (!this.categories['local']) {
        this.categories['local'] = [];
      }
      
      // Don't add duplicates
      if (!this.categories['local'].includes(fontName)) {
        this.categories['local'].push(fontName);
      }
      
      // Store the URL mapping
      this.localFontUrls.set(fontName, url);
      
      // Mark as loaded
      this.loadedFonts.add(fontName);
      
      // Save to localStorage
      this.saveLocalFontsToStorage();
      
      return true;
    } catch (error) {
      console.error("Error registering local font:", error);
      return false;
    }
  }
  
  /**
   * Save local fonts to localStorage for persistence
   */
  private saveLocalFontsToStorage(): void {
    try {
      // Convert the Map to a plain object for JSON serialization
      const urlMap: Record<string, string> = {};
      this.localFontUrls.forEach((url, fontName) => {
        urlMap[fontName] = url;
      });
      
      const fontData = {
        fontNames: this.categories['local'] || [],
        urlMap
      };
      
      localStorage.setItem('localFonts', JSON.stringify(fontData));
    } catch (error) {
      console.error("Error saving local fonts to storage:", error);
    }
  }
  
  /**
   * Check if a font is a local font
   * @param fontFamily The font family name to check
   * @returns True if it's a local font
   */
  isLocalFont(fontFamily: string): boolean {
    return this.categories['local']?.includes(fontFamily) || false;
  }
  
  /**
   * Get the URL for a local font
   * @param fontFamily The font family name
   * @returns The URL or undefined if not found
   */
  getLocalFontUrl(fontFamily: string): string | undefined {
    return this.localFontUrls.get(fontFamily);
  }
}

export default new GoogleFontsService();
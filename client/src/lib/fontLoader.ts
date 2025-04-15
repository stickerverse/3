import WebFont from 'webfontloader';
import { apiRequest } from './queryClient';

// Default font categories in case API fails
export const fontCategories: Record<string, string[]> = {
  'serif': [
    'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Libre Baskerville',
    'Source Serif Pro', 'PT Serif', 'Noto Serif', 'Cormorant Garamond', 'Spectral'
  ],
  'sans-serif': [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Raleway', 'Poppins', 'Work Sans',
    'Nunito', 'Source Sans Pro', 'Inter', 'Rubik', 'Archivo', 'DM Sans'
  ],
  'display': [
    'Bebas Neue', 'Anton', 'Passion One', 'Permanent Marker', 'Pacifico', 'Righteous',
    'Alfa Slab One', 'Bungee', 'Abril Fatface', 'Archivo Black', 'Staatliches'
  ],
  'handwriting': [
    'Dancing Script', 'Caveat', 'Sacramento', 'Satisfy', 'Great Vibes', 'Kaushan Script',
    'Indie Flower', 'Shadows Into Light', 'Amatic SC', 'Patrick Hand'
  ],
  'monospace': [
    'Roboto Mono', 'Source Code Pro', 'IBM Plex Mono', 'Space Mono', 'JetBrains Mono',
    'Courier Prime', 'DM Mono', 'Fira Code', 'Ubuntu Mono', 'Anonymous Pro'
  ],
};

// Cache for API responses
let googleFontsCache: {
  fonts: Array<{family: string, category: string, variants: string[]}>,
  categories: Record<string, string[]>
} | null = null;

// Cache for local fonts
let localFontsCache: Array<{
  family: string, 
  fileName: string, 
  url: string, 
  category: string, 
  isLocal: boolean
}> | null = null;

// All fonts in a single array
export const allFonts = Object.values(fontCategories).flat();

// Fetch local fonts from our API
export async function fetchLocalFonts(): Promise<Array<{
  family: string, 
  fileName: string, 
  url: string, 
  category: string, 
  isLocal: boolean
}>> {
  // Return from cache if available
  if (localFontsCache) {
    return localFontsCache;
  }
  
  try {
    const response = await apiRequest('GET', '/api/fonts/local');
    
    if (response.ok) {
      const data = await response.json();
      localFontsCache = data.fonts;
      return data.fonts;
    } else {
      throw new Error('Failed to fetch local fonts');
    }
  } catch (error) {
    console.error('Error fetching local fonts:', error);
    return [];
  }
}

// Load a local font given its URL
export function loadLocalFont(fontFamily: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fontFace = new FontFace(fontFamily, `url(${url})`);
    
    fontFace.load()
      .then(loadedFace => {
        document.fonts.add(loadedFace);
        resolve();
      })
      .catch(err => {
        console.error(`Error loading local font ${fontFamily}:`, err);
        reject(err);
      });
  });
}

// Fetch font data from our API
export async function fetchGoogleFonts(sort = 'popularity'): Promise<{
  fonts: Array<{family: string, category: string, variants: string[]}>,
  categories: Record<string, string[]>
}> {
  // Return from cache if available
  if (googleFontsCache) {
    return googleFontsCache;
  }
  
  try {
    const response = await apiRequest('GET', `/api/fonts?sort=${sort}`);
    
    if (response.ok) {
      const data = await response.json();
      googleFontsCache = data;
      return data;
    } else {
      throw new Error('Failed to fetch Google Fonts');
    }
  } catch (error) {
    console.error('Error fetching Google Fonts:', error);
    // Return default categories as fallback
    return {
      fonts: allFonts.map(font => ({
        family: font,
        category: 'unknown',
        variants: ['regular']
      })),
      categories: fontCategories
    };
  }
}

// Keep track of loaded fonts to avoid reloading
const loadedFontsCache = new Set<string>();

// Load a batch of fonts with retry
export function loadFontBatch(fontFamilies: string[]): Promise<void> {
  // Filter out already loaded fonts
  const fontsToLoad = fontFamilies.filter(font => !loadedFontsCache.has(font));
  
  // If all fonts are already loaded, resolve immediately
  if (fontsToLoad.length === 0) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    // Add font preload links to document head first
    fontsToLoad.forEach(fontFamily => {
      try {
        // Sanitize the font name for the URL
        const encodedFont = fontFamily.replace(/ /g, '+');
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      } catch (err) {
        console.warn(`Error preloading font ${fontFamily}:`, err);
      }
    });
    
    // Then use WebFont loader
    WebFont.load({
      google: {
        families: fontsToLoad,
        text: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' // Load only essential characters initially
      },
      classes: false, // Don't add classes to improve performance
      events: false,  // Disable events for better performance
      active: () => {
        console.log('Fonts loaded:', fontsToLoad.length, 'fonts');
        // Add to cache
        fontsToLoad.forEach(font => loadedFontsCache.add(font));
        resolve();
      },
      inactive: () => {
        console.warn('Some fonts failed to load:', fontsToLoad);
        // Still mark as attempted to avoid retrying constantly
        fontsToLoad.forEach(font => loadedFontsCache.add(font));
        resolve(); // Resolve instead of reject to avoid blocking UI
      },
      timeout: 5000 // Increased timeout for better reliability
    });
  });
}

// Load fonts by category
export async function loadFontsByCategory(category: string): Promise<void> {
  try {
    // Fetch the latest font data if we don't have it
    if (!googleFontsCache) {
      await fetchGoogleFonts();
    }
    
    // Use Google Fonts API data if available
    if (googleFontsCache) {
      const fonts = googleFontsCache.categories[category] || [];
      if (fonts.length > 0) {
        return loadFontBatch(fonts);
      }
    }
    
    // Fallback to predefined categories
    const fonts = fontCategories[category as keyof typeof fontCategories] || [];
    return loadFontBatch(fonts);
  } catch (error) {
    console.error(`Error loading fonts for category ${category}:`, error);
    // Fallback to predefined categories
    const fonts = fontCategories[category as keyof typeof fontCategories] || [];
    return loadFontBatch(fonts);
  }
}

// Load all fonts
export async function loadAllFonts(): Promise<void> {
  try {
    // Fetch the latest font data
    const data = await fetchGoogleFonts();
    
    // Get the most popular fonts from each category (to avoid loading too many)
    const popularFonts: string[] = [];
    
    // Take 20 fonts from each category
    Object.values(data.categories).forEach(fonts => {
      popularFonts.push(...fonts.slice(0, 20));
    });
    
    // Load fonts in smaller batches to avoid Google Fonts API limitations
    const batchSize = 15;
    const batches = [];
    
    for (let i = 0; i < popularFonts.length; i += batchSize) {
      const batch = popularFonts.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    // Load each batch sequentially to avoid overwhelming the network
    for (const batch of batches) {
      try {
        await loadFontBatch(batch);
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error loading font batch:', error);
      }
    }
    
    console.log('All fonts loaded successfully');
  } catch (error) {
    console.error('Error loading all fonts:', error);
    
    // Fallback to loading predefined fonts
    const batchSize = 15;
    const batches = [];
    
    for (let i = 0; i < allFonts.length; i += batchSize) {
      const batch = allFonts.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    for (const batch of batches) {
      try {
        await loadFontBatch(batch);
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error('Error loading fallback font batch:', err);
      }
    }
  }
}

// Check if a font is already loaded
export function isFontLoaded(fontFamily: string): boolean {
  try {
    const testElement = document.createElement('span');
    testElement.style.fontFamily = `'${fontFamily}', 'serif'`;
    testElement.style.visibility = 'hidden';
    testElement.textContent = 'Test';
    document.body.appendChild(testElement);
    
    const width = testElement.offsetWidth;
    
    // Change to a definitely different font
    testElement.style.fontFamily = 'monospace';
    const widthAfter = testElement.offsetWidth;
    
    document.body.removeChild(testElement);
    
    // If widths are different, the first font was likely loaded
    return width !== widthAfter;
  } catch (error) {
    console.error('Error checking if font is loaded:', error);
    return false;
  }
}

// Get a sample of fonts from each category
export function getFontSamples(count = 3): string[] {
  const samples: string[] = [];
  
  if (googleFontsCache) {
    // Use API data if available
    for (const category in googleFontsCache.categories) {
      const fonts = googleFontsCache.categories[category];
      const randomFonts = [...fonts].sort(() => 0.5 - Math.random()).slice(0, count);
      samples.push(...randomFonts);
    }
  } else {
    // Fallback to predefined categories
    for (const category in fontCategories) {
      const fonts = fontCategories[category as keyof typeof fontCategories];
      const randomFonts = [...fonts].sort(() => 0.5 - Math.random()).slice(0, count);
      samples.push(...randomFonts);
    }
  }
  
  return samples;
}
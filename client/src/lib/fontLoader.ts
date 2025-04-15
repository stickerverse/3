import WebFont from 'webfontloader';

// Font categories based on Google Fonts
export const fontCategories = {
  'Serif': [
    'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text', 'Libre Baskerville',
    'Source Serif Pro', 'PT Serif', 'Noto Serif', 'Cormorant Garamond', 'Spectral'
  ],
  'Sans Serif': [
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Raleway', 'Poppins', 'Work Sans',
    'Nunito', 'Source Sans Pro', 'Inter', 'Rubik', 'Archivo', 'DM Sans'
  ],
  'Display': [
    'Bebas Neue', 'Anton', 'Passion One', 'Permanent Marker', 'Pacifico', 'Righteous',
    'Alfa Slab One', 'Bungee', 'Abril Fatface', 'Archivo Black', 'Staatliches'
  ],
  'Handwriting': [
    'Dancing Script', 'Caveat', 'Sacramento', 'Satisfy', 'Great Vibes', 'Kaushan Script',
    'Indie Flower', 'Shadows Into Light', 'Amatic SC', 'Patrick Hand'
  ],
  'Monospace': [
    'Roboto Mono', 'Source Code Pro', 'IBM Plex Mono', 'Space Mono', 'JetBrains Mono',
    'Courier Prime', 'DM Mono', 'Fira Code', 'Ubuntu Mono', 'Anonymous Pro'
  ],
};

// All fonts in a single array
export const allFonts = Object.values(fontCategories).flat();

// Load a batch of fonts
export function loadFontBatch(fontFamilies: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    WebFont.load({
      google: {
        families: fontFamilies
      },
      active: () => {
        console.log('Fonts loaded:', fontFamilies);
        resolve();
      },
      inactive: () => {
        console.error('Failed to load fonts:', fontFamilies);
        reject(new Error('Failed to load fonts'));
      }
    });
  });
}

// Load fonts by category
export function loadFontsByCategory(category: string): Promise<void> {
  const fonts = fontCategories[category as keyof typeof fontCategories] || [];
  return loadFontBatch(fonts);
}

// Load all fonts
export async function loadAllFonts(): Promise<void> {
  // Load fonts in smaller batches to avoid Google Fonts API limitations
  const batchSize = 15;
  const batches = [];
  
  for (let i = 0; i < allFonts.length; i += batchSize) {
    const batch = allFonts.slice(i, i + batchSize);
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
}

// Check if a font is already loaded
export function isFontLoaded(fontFamily: string): boolean {
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
}

// Get a sample of fonts from each category
export function getFontSamples(count = 3): string[] {
  const samples: string[] = [];
  
  for (const category in fontCategories) {
    const fonts = fontCategories[category as keyof typeof fontCategories];
    const randomFonts = [...fonts].sort(() => 0.5 - Math.random()).slice(0, count);
    samples.push(...randomFonts);
  }
  
  return samples;
}
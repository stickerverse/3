/**
 * Lighten or darken a color
 * @param color Hex color code
 * @param factor 0-1 for lightening, > 1 for darkening
 * @returns New hex color
 */
export function tintColor(color: string, factor: number): string {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Lighten or darken
  if (factor < 1) {
    // Lighten
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
  } else {
    // Darken
    r = Math.round(r * (1 - factor + 1));
    g = Math.round(g * (1 - factor + 1));
    b = Math.round(b * (1 - factor + 1));
  }
  
  // Make sure we're within RGB bounds
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a complementary color
 * @param color Hex color code
 * @returns Complementary hex color
 */
export function complementaryColor(color: string): string {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Invert the colors
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Calculate color luminance to determine if text should be dark or light
 * @param color Hex color code
 * @returns true if color is light, false if dark
 */
export function isColorLight(color: string): boolean {
  const r = parseInt(color.substring(1, 3), 16);
  const g = parseInt(color.substring(3, 5), 16);
  const b = parseInt(color.substring(5, 7), 16);
  
  // Calculate luminance using the formula: 0.299R + 0.587G + 0.114B
  // This gives more weight to green as human eyes are more sensitive to it
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is greater than 0.5, the color is considered light
  return luminance > 0.5;
}

/**
 * Get a contrasting text color (black or white) based on background
 * @param backgroundColor Hex color code
 * @returns "#000000" for light backgrounds, "#ffffff" for dark
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isColorLight(backgroundColor) ? "#000000" : "#ffffff";
}

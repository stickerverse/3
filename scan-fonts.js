
// scan-fonts.js - Works both as CommonJS and as direct node script
const fs = require('fs');
const path = require('path');

// Configuration
const FONTS_FOLDER = path.join(process.cwd(), "fonts");
const OUTPUT_FILE = path.join(process.cwd(), "fonts.json");
const PUBLIC_OUTPUT_FILE = path.join(process.cwd(), "public", "fonts.json");
const FONT_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2"];

// Function to scan the fonts folder
function scanFontsFolder() {
  console.log(`Scanning fonts folder: ${FONTS_FOLDER}`);

  // Check if the fonts folder exists
  if (!fs.existsSync(FONTS_FOLDER)) {
    console.error(`Fonts folder not found: ${FONTS_FOLDER}`);
    fs.mkdirSync(FONTS_FOLDER, { recursive: true });
    return [];
  }

  // Get all files in the fonts folder recursively
  try {
    const fontFiles = [];

    function scanDir(dir) {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively scan subdirectories
          scanDir(filePath);
        } else {
          // Check if it's a font file
          const ext = path.extname(file).toLowerCase();
          if (FONT_EXTENSIONS.includes(ext)) {
            // Add relative path from fonts folder
            const relativePath = path.relative(FONTS_FOLDER, filePath);
            fontFiles.push(relativePath.replace(/\\/g, "/")); // Normalize path separators
          }
        }
      });
    }

    scanDir(FONTS_FOLDER);
    console.log(`Found ${fontFiles.length} font files`);
    return fontFiles;
  } catch (error) {
    console.error(`Error scanning fonts folder: ${error.message}`);
    return [];
  }
}

// Function to create fonts-metadata.json with display names
function createFontMetadata(fontFiles) {
  const metadata = fontFiles.map(fontPath => {
    const fileName = path.basename(fontPath);
    const ext = path.extname(fileName).toLowerCase();
    let displayName = fileName.replace(ext, '')
      .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
      .replace(/([_-])/g, ' ') // Replace underscores and hyphens with spaces
      .trim();
    
    return {
      path: fontPath,
      name: displayName,
      format: getFormatFromExtension(ext.substring(1)) // Remove the dot
    };
  });
  
  return metadata;
}

// Helper function to get font format based on file extension
function getFormatFromExtension(ext) {
  switch (ext) {
    case "ttf":
      return "truetype";
    case "otf":
      return "opentype";
    case "woff":
      return "woff";
    case "woff2":
      return "woff2";
    default:
      return "truetype";
  }
}

// Main function
function main() {
  // Scan the fonts folder
  const fontFiles = scanFontsFolder();

  if (fontFiles.length === 0) {
    console.warn(
      "No font files found. Make sure your fonts are in the correct folder."
    );
  }

  // Create public directory if it doesn't exist
  const publicDir = path.dirname(PUBLIC_OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the font list to a JSON file
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fontFiles, null, 2));
    console.log(`Wrote ${fontFiles.length} font files to ${OUTPUT_FILE}`);
    
    // Also copy to public folder
    fs.writeFileSync(PUBLIC_OUTPUT_FILE, JSON.stringify(fontFiles, null, 2));
    console.log(`Also copied to ${PUBLIC_OUTPUT_FILE}`);
    
    // Generate and save metadata
    const metadata = createFontMetadata(fontFiles);
    fs.writeFileSync(
      path.join(process.cwd(), "public", "fonts-metadata.json"),
      JSON.stringify(metadata, null, 2)
    );
    console.log(`Created fonts-metadata.json with ${metadata.length} entries`);
  } catch (error) {
    console.error(`Error writing font list to file: ${error.message}`);
  }
  
  return fontFiles;
}

// Run the main function if this file is being executed directly
if (require.main === module) {
  main();
  console.log("Done. Your fonts should now be available in the application.");
}

// Export for use as a module
module.exports = { scanFontsFolder, main };

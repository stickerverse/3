// scan-fonts.js - ES Module version
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const FONTS_FOLDER = path.join(__dirname, "fonts");
const OUTPUT_FILE = path.join(__dirname, "fonts.json");
const FONT_EXTENSIONS = [".ttf", ".otf", ".woff", ".woff2"];

// Function to scan the fonts folder
function scanFontsFolder() {
  console.log(`Scanning fonts folder: ${FONTS_FOLDER}`);

  // Check if the fonts folder exists
  if (!fs.existsSync(FONTS_FOLDER)) {
    console.error(`Fonts folder not found: ${FONTS_FOLDER}`);
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

// Main function
function main() {
  // Scan the fonts folder
  const fontFiles = scanFontsFolder();

  if (fontFiles.length === 0) {
    console.warn(
      "No font files found. Make sure your fonts are in the correct folder.",
    );
    return;
  }

  // Write the font list to a JSON file
  try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fontFiles, null, 2));
    console.log(`Wrote ${fontFiles.length} font files to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`Error writing font list to file: ${error.message}`);
  }
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

// Run the main function
main();

console.log("Done. To use this output in your Replit project:");
console.log("1. Make sure your fonts.json file is accessible at /fonts.json");
console.log("2. Include the HTML/CSS/JS code from the Font Previewer artifact");
console.log(
  "3. Your fonts should now appear in a grid layout similar to Fontcloud",
);

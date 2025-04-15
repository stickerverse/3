const fs = require('fs');
const path = require('path');
const fontkit = require('fontkit');

// Configuration
const fontsDir = path.join(process.cwd(), 'fonts');
const outputFile = path.join(process.cwd(), 'fonts.json');
const publicOutputFile = path.join(process.cwd(), 'public', 'fonts.json');
const metadataFile = path.join(process.cwd(), 'fonts-metadata.json');
const publicMetadataFile = path.join(process.cwd(), 'public', 'fonts-metadata.json');

console.log(`Scanning fonts folder: ${fontsDir}`);

// Ensure the public directory exists
if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
  fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
}

// Read font directory recursively
function scanFontsDir(dir) {
  let fontPaths = [];
  let metadata = [];

  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Recursively scan subdirectories
      const subDirFonts = scanFontsDir(fullPath);
      fontPaths = [...fontPaths, ...subDirFonts.fontPaths];
      metadata = [...metadata, ...subDirFonts.metadata];
    } else if (/\.(ttf|otf|woff|woff2)$/i.test(file.name)) {
      // This is a font file
      const relativePath = path.relative(fontsDir, fullPath);
      fontPaths.push(relativePath);

      // Extract font metadata
      try {
        const font = fontkit.openSync(fullPath);
        const fontInfo = {
          path: relativePath,
          name: font.fullName || font.familyName || file.name.replace(/\.(ttf|otf|woff|woff2)$/i, ''),
          format: getFormatFromExtension(file.name)
        };
        metadata.push(fontInfo);
      } catch (err) {
        // If we can't read the font, still include it but with basic info
        metadata.push({
          path: relativePath,
          name: file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '')
            .split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
          format: getFormatFromExtension(file.name)
        });
      }
    }
  }

  return { fontPaths, metadata };
}

// Get font format based on file extension
function getFormatFromExtension(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.ttf': return 'truetype';
    case '.otf': return 'opentype';
    case '.woff': return 'woff';
    case '.woff2': return 'woff2';
    default: return 'unknown';
  }
}

// Scan fonts directory
try {
  const { fontPaths, metadata } = scanFontsDir(fontsDir);

  console.log(`Found ${fontPaths.length} font files`);

  // Write fonts.json
  fs.writeFileSync(outputFile, JSON.stringify(fontPaths, null, 2));
  console.log(`Wrote ${fontPaths.length} font files to ${outputFile}`);

  // Copy to public folder
  fs.writeFileSync(publicOutputFile, JSON.stringify(fontPaths, null, 2));
  console.log(`Also copied to ${publicOutputFile}`);

  // Write metadata
  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  console.log(`Created fonts-metadata.json with ${metadata.length} entries`);

  // Copy metadata to public folder
  fs.writeFileSync(publicMetadataFile, JSON.stringify(metadata, null, 2));
  console.log(`Also copied fonts-metadata.json to public folder`);

  console.log('Done. Your fonts should now be available in the application.');
} catch (error) {
  console.error('Error scanning fonts:', error);
  process.exit(1);
}
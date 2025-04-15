
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Scan fonts on server startup and ensure fonts.json exists
const scanFonts = () => {
  try {
    console.log('Scanning fonts directory...');
    const fontsDir = path.join(process.cwd(), 'fonts');
    const fontsJsonPath = path.join(process.cwd(), 'public', 'fonts.json');
    const fontsMetadataPath = path.join(process.cwd(), 'public', 'fonts-metadata.json');
    const fontsExists = fs.existsSync(fontsDir);
    
    if (!fontsExists) {
      console.log('Creating fonts directory...');
      fs.mkdirSync(fontsDir, { recursive: true });
    }
    
    // Ensure public directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
      fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
    }
    
    console.log('Running font scan script...');
    // Run the scan-fonts.js script to generate fonts.json - use import syntax
    exec('node --experimental-specifier-resolution=node scan-fonts.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error scanning fonts: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Font scan stderr: ${stderr}`);
      }
      console.log(`Font scan stdout: ${stdout}`);
      
      // Copy the fonts.json to public folder for client access
      try {
        if (fs.existsSync(path.join(process.cwd(), 'fonts.json'))) {
          const fontsJson = fs.readFileSync(path.join(process.cwd(), 'fonts.json'));
          fs.writeFileSync(fontsJsonPath, fontsJson);
          console.log('Copied fonts.json to public folder');
        } else {
          console.error('fonts.json not found after scan');
        }
        
        // Copy the fonts-metadata.json to public folder
        const metadataJsonPath = path.join(process.cwd(), 'fonts-metadata.json');
        const publicMetadataPath = path.join(process.cwd(), 'public', 'fonts-metadata.json');
        
        if (fs.existsSync(metadataJsonPath)) {
          const metadataJson = fs.readFileSync(metadataJsonPath);
          fs.writeFileSync(fontsMetadataPath, metadataJson);
          console.log('Copied fonts-metadata.json to public folder');
        } else if (fs.existsSync(publicMetadataPath)) {
          console.log('fonts-metadata.json already exists in public folder');
        } else {
          console.error('fonts-metadata.json not found after scan');
        }
      } catch (copyError) {
        console.error('Error copying font files to public folder:', copyError);
      }
    });
  } catch (error) {
    console.error('Error in scanFonts:', error);
  }
};

// Run font scan on startup
scanFonts();

// Register API routes
registerRoutes(app).then(() => {
  console.log('Routes registered successfully');
});

// Serve static files from the public directory
app.use(express.static('public'));

// Create HTTP server
const server = app.listen(port, '0.0.0.0', () => {
  log(`serving on port ${port}`);
});

// For development, set up Vite dev server
if (!isProduction) {
  setupVite(app, server).then(() => {
    log('Vite dev server started');
  });
} else {
  // For production, serve the built client
  serveStatic(app);
}

export default app;

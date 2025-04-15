
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes';
import { createViteDevServer } from './vite';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();
const port = process.env.PORT || 5000;
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
    const fontsExists = fs.existsSync(fontsDir);
    
    if (!fontsExists) {
      console.log('Creating fonts directory...');
      fs.mkdirSync(fontsDir, { recursive: true });
    }
    
    console.log('Running font scan script...');
    // Run the scan-fonts.js script to generate fonts.json
    exec('node scan-fonts.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error scanning fonts: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Font scan stderr: ${stderr}`);
      }
      console.log(`Font scan stdout: ${stdout}`);
      
      // Also copy the fonts.json to public folder for client access
      try {
        const fontsJson = fs.readFileSync(path.join(process.cwd(), 'fonts.json'));
        fs.writeFileSync(fontsJsonPath, fontsJson);
        console.log('Copied fonts.json to public folder');
      } catch (copyError) {
        console.error('Error copying fonts.json to public folder:', copyError);
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

// For development, set up Vite dev server
if (!isProduction) {
  createViteDevServer(app).then(() => {
    console.log(`[express] serving on port ${port}`);
  });
} else {
  // For production, serve the built client
  app.use(express.static(path.resolve(__dirname, '../client/dist')));
  
  // Serve index.html for all other routes for SPA client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist/index.html'));
  });
  
  app.listen(port, () => {
    console.log(`[express] serving on port ${port}`);
  });
}

export default app;

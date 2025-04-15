import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";
import * as fs from "fs";
import path from "path";
import express from "express";
import { exec } from 'child_process';


export async function registerRoutes(app: express.Express): Promise<Server> {
  // Serve standalone font previewer
  app.get("/standalone-font-previewer", (req, res) => {
    const htmlPath = path.resolve(import.meta.dirname, "..", "index.html");

    if (!fs.existsSync(htmlPath)) {
      console.error("Error: index.html not found at", htmlPath);
      return res.status(404).send("Font previewer not found");
    }

    try {
      let html = fs.readFileSync(htmlPath, "utf-8");

      // Set appropriate headers
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache');

      // Serve the HTML
      res.send(html);
    } catch (error) {
      console.error("Error serving font previewer:", error);
      res.status(500).send("Error loading font previewer");
    }
  });
  
  // Add an endpoint to scan fonts directory and generate metadata
  app.post("/api/scan-fonts", (req, res) => {
    console.log("Received request to scan fonts directory");
    
    // Path to the script
    const scriptPath = path.resolve(import.meta.dirname, "..", "scan-fonts.js");
    
    if (!fs.existsSync(scriptPath)) {
      console.error("Error: scan-fonts.js not found at", scriptPath);
      return res.status(404).json({ error: "Font scanner script not found" });
    }
    
    try {
      // Execute the script
      exec(`node ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing font scan script:", error);
          return res.status(500).json({ error: "Failed to scan fonts", details: error.message });
        }
        
        if (stderr) {
          console.error("Font scan script stderr:", stderr);
        }
        
        console.log("Font scan stdout:", stdout);
        
        // Copy the generated fonts.json to the public directory
        const fontJsonPath = path.resolve(import.meta.dirname, "..", "fonts.json");
        const publicFontJsonPath = path.resolve(import.meta.dirname, "..", "public", "fonts.json");
        
        if (fs.existsSync(fontJsonPath)) {
          fs.copyFileSync(fontJsonPath, publicFontJsonPath);
          console.log("Copied fonts.json to public folder");
        }
        
        // Check if fonts-metadata.json exists and also copy it
        const fontMetadataPath = path.resolve(import.meta.dirname, "..", "fonts-metadata.json");
        const publicFontMetadataPath = path.resolve(import.meta.dirname, "..", "public", "fonts-metadata.json");
        
        if (fs.existsSync(fontMetadataPath)) {
          fs.copyFileSync(fontMetadataPath, publicFontMetadataPath);
          console.log("fonts-metadata.json already exists in public folder");
        } else {
          console.log("fonts-metadata.json not found after scan");
        }
        
        // Return success response
        res.json({ 
          success: true, 
          message: "Font scan completed successfully",
          fontCount: fs.existsSync(publicFontJsonPath) ? 
            JSON.parse(fs.readFileSync(publicFontJsonPath, 'utf-8')).length : 0
        });
      });
    } catch (error) {
      console.error("Error initiating font scan:", error);
      res.status(500).json({ error: "Failed to initiate font scan" });
    }
  });

  // Serve fonts
  app.use("/fonts", express.static(path.resolve(import.meta.dirname, "..", "fonts")));

  // Serve fonts.json file
  app.get("/fonts.json", (req, res) => {
    const fontsJsonPath = path.resolve(import.meta.dirname, "..", "public", "fonts.json");
    if (fs.existsSync(fontsJsonPath)) {
      res.sendFile(fontsJsonPath);
    } else {
      // Fallback to root fonts.json if not in public folder
      const rootFontsJsonPath = path.resolve(import.meta.dirname, "..", "fonts.json");
      if (fs.existsSync(rootFontsJsonPath)) {
        res.sendFile(rootFontsJsonPath);
      } else {
        res.status(404).json({ message: "fonts.json not found" });
      }
    }
  });

  // Serve fonts-metadata.json file
  app.get("/fonts-metadata.json", (req, res) => {
    const metadataPath = path.resolve(import.meta.dirname, "..", "public", "fonts-metadata.json");
    if (fs.existsSync(metadataPath)) {
      res.sendFile(metadataPath);
    } else {
      // Fallback to root fonts-metadata.json
      const rootMetadataPath = path.resolve(import.meta.dirname, "..", "fonts-metadata.json");
      if (fs.existsSync(rootMetadataPath)) {
        res.sendFile(rootMetadataPath);
      } else {
        res.status(404).json({ message: "fonts-metadata.json not found" });
      }
    }
  });

  // Define routes for designs

  // Get all designs
  app.get("/api/designs", async (req, res) => {
    try {
      const designs = await storage.getAllDesigns();
      res.json(designs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designs" });
    }
  });

  // Get a design by ID
  app.get("/api/designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid design ID" });
      }

      const design = await storage.getDesign(id);
      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }

      res.json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch design" });
    }
  });

  // Create a new design
  app.post("/api/designs", async (req, res) => {
    try {
      // Validate request body
      const designSchema = z.object({
        name: z.string().min(1),
        data: z.string().min(1)
      });

      const validationResult = designSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid design data", 
          errors: validationResult.error.format() 
        });
      }

      const { name, data } = validationResult.data;
      const design = await storage.createDesign({ name, data });

      res.status(201).json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to create design" });
    }
  });

  // Update a design
  app.put("/api/designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid design ID" });
      }

      // Validate request body
      const designSchema = z.object({
        name: z.string().min(1),
        data: z.string().min(1)
      });

      const validationResult = designSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid design data", 
          errors: validationResult.error.format() 
        });
      }

      const { name, data } = validationResult.data;
      const design = await storage.updateDesign(id, { name, data });

      if (!design) {
        return res.status(404).json({ message: "Design not found" });
      }

      res.json(design);
    } catch (error) {
      res.status(500).json({ message: "Failed to update design" });
    }
  });

  // Delete a design
  app.delete("/api/designs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid design ID" });
      }

      const success = await storage.deleteDesign(id);
      if (!success) {
        return res.status(404).json({ message: "Design not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete design" });
    }
  });

  // Vinyl Size Routes

  // Get all vinyl sizes
  app.get("/api/vinyl-sizes", async (req, res) => {
    try {
      const sizes = await storage.getAllVinylSizes();
      res.json(sizes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vinyl sizes" });
    }
  });

  // Get default vinyl size
  app.get("/api/vinyl-sizes/default", async (req, res) => {
    try {
      const size = await storage.getDefaultVinylSize();
      if (!size) {
        return res.status(404).json({ message: "No default vinyl size found" });
      }
      res.json(size);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default vinyl size" });
    }
  });

  // Get a vinyl size by ID
  app.get("/api/vinyl-sizes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vinyl size ID" });
      }

      const size = await storage.getVinylSize(id);
      if (!size) {
        return res.status(404).json({ message: "Vinyl size not found" });
      }

      res.json(size);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vinyl size" });
    }
  });

  // Create a new vinyl size
  app.post("/api/vinyl-sizes", async (req, res) => {
    try {
      // Validate request body
      const sizeSchema = z.object({
        name: z.string().min(1),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        description: z.string().optional(),
        recommendedFor: z.string().optional(),
        default: z.boolean().optional()
      });

      const validationResult = sizeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid vinyl size data", 
          errors: validationResult.error.format() 
        });
      }

      const size = await storage.createVinylSize(validationResult.data);
      res.status(201).json(size);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vinyl size" });
    }
  });

  // Update a vinyl size
  app.put("/api/vinyl-sizes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vinyl size ID" });
      }

      // Validate request body
      const sizeSchema = z.object({
        name: z.string().min(1).optional(),
        width: z.number().int().positive().optional(),
        height: z.number().int().positive().optional(),
        description: z.string().optional(),
        recommendedFor: z.string().optional(),
        default: z.boolean().optional()
      });

      const validationResult = sizeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid vinyl size data", 
          errors: validationResult.error.format() 
        });
      }

      const size = await storage.updateVinylSize(id, validationResult.data);
      if (!size) {
        return res.status(404).json({ message: "Vinyl size not found" });
      }

      res.json(size);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vinyl size" });
    }
  });

  // Delete a vinyl size
  app.delete("/api/vinyl-sizes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vinyl size ID" });
      }

      const success = await storage.deleteVinylSize(id);
      if (!success) {
        return res.status(404).json({ message: "Vinyl size not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vinyl size" });
    }
  });

  // Vinyl Material Routes

  // Get all vinyl materials
  app.get("/api/vinyl-materials", async (req, res) => {
    try {
      const materials = await storage.getAllVinylMaterials();
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vinyl materials" });
    }
  });

  // Get default vinyl material
  app.get("/api/vinyl-materials/default", async (req, res) => {
    try {
      const material = await storage.getDefaultVinylMaterial();
      if (!material) {
        return res.status(404).json({ message: "No default vinyl material found" });
      }
      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default vinyl material" });
    }
  });

  // Get a vinyl material by ID
  app.get("/api/vinyl-materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vinyl material ID" });
      }

      const material = await storage.getVinylMaterial(id);
      if (!material) {
        return res.status(404).json({ message: "Vinyl material not found" });
      }

      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vinyl material" });
    }
  });

  // Create a new vinyl material
  app.post("/api/vinyl-materials", async (req, res) => {
    try {
      // Validate request body
      const materialSchema = z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        color: z.string().optional(),
        durability: z.string().optional(),
        description: z.string().optional(),
        default: z.boolean().optional()
      });

      const validationResult = materialSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid vinyl material data", 
          errors: validationResult.error.format() 
        });
      }

      const material = await storage.createVinylMaterial(validationResult.data);
      res.status(201).json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to create vinyl material" });
    }
  });

  // Update a vinyl material
  app.put("/api/vinyl-materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vinyl material ID" });
      }

      // Validate request body
      const materialSchema = z.object({
        name: z.string().min(1).optional(),
        type: z.string().min(1).optional(),
        color: z.string().optional(),
        durability: z.string().optional(),
        description: z.string().optional(),
        default: z.boolean().optional()
      });

      const validationResult = materialSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid vinyl material data", 
          errors: validationResult.error.format() 
        });
      }

      const material = await storage.updateVinylMaterial(id, validationResult.data);
      if (!material) {
        return res.status(404).json({ message: "Vinyl material not found" });
      }

      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to update vinyl material" });
    }
  });

  // Delete a vinyl material
  app.delete("/api/vinyl-materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid vinyl material ID" });
      }

      const success = await storage.deleteVinylMaterial(id);
      if (!success) {
        return res.status(404).json({ message: "Vinyl material not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete vinyl material" });
    }
  });

  // Upload local font file
  app.post("/api/fonts/upload", async (req, res) => {
    try {
      // Font file comes as base64 encoded data
      const { fontName, fontFile, fontType } = req.body;

      if (!fontName || !fontFile) {
        return res.status(400).json({ message: "Font name and font file are required" });
      }

      // Decode base64 string to get font file data
      const base64Data = fontFile.replace(/^data:.*?;base64,/, "");
      const fontBuffer = Buffer.from(base64Data, 'base64');

      // Save font file to public folder for serving
      const fontFileName = `${fontName.replace(/\s+/g, '-').toLowerCase()}.${fontType || 'ttf'}`;
      const fontDirectory = './public/fonts';

      // Create directory if it doesn't exist
      if (!fs.existsSync(fontDirectory)) {
        fs.mkdirSync(fontDirectory, { recursive: true });
      }

      const fontPath = `${fontDirectory}/${fontFileName}`;
      fs.writeFileSync(fontPath, fontBuffer);

      res.status(200).json({ 
        success: true, 
        fontName,
        fileName: fontFileName,
        url: `/fonts/${fontFileName}` 
      });
    } catch (error) {
      console.error('Error uploading font:', error);
      res.status(500).json({ message: "Failed to upload font file" });
    }
  });

  // Get list of local fonts
  app.get("/api/fonts/local", (req, res) => {
    try {
      const fontDirectory = './public/fonts';

      // Create directory if it doesn't exist
      if (!fs.existsSync(fontDirectory)) {
        fs.mkdirSync(fontDirectory, { recursive: true });
        return res.json({ fonts: [] });
      }

      // Get all font files
      const fontFiles = fs.readdirSync(fontDirectory)
        .filter(file => /\.(ttf|otf|woff|woff2)$/i.test(file));

      // Format the response
      const localFonts = fontFiles.map(file => {
        const fontName = file.replace(/\.(ttf|otf|woff|woff2)$/i, '')
          .split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

        return {
          family: fontName,
          fileName: file,
          url: `/fonts/${file}`,
          category: 'local',
          isLocal: true
        };
      });

      res.json({ fonts: localFonts });
    } catch (error) {
      console.error('Error getting local fonts:', error);
      res.status(500).json({ message: "Failed to get local fonts", fonts: [] });
    }
  });

  // Get Google Fonts
  app.get("/api/fonts", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_FONTS_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ message: "Google Fonts API key not configured" });
      }

      // Build query parameters according to the API documentation
      const queryParams = new URLSearchParams();
      queryParams.append('key', apiKey);

      // Support sorting (default to popularity)
      const sort = req.query.sort as string || 'popularity';
      if (['alpha', 'date', 'popularity', 'style', 'trending'].includes(sort)) {
        queryParams.append('sort', sort);
      }

      // Support category filtering
      const category = req.query.category as string;
      if (category) {
        queryParams.append('category', category);
      }

      // Support subset filtering
      const subset = req.query.subset as string;
      if (subset) {
        queryParams.append('subset', subset);
      }

      // Request WOFF2 capability for better performance
      queryParams.append('capability', 'WOFF2');

      // Build the final URL
      const url = `https://www.googleapis.com/webfonts/v1/webfonts?${queryParams.toString()}`;

      console.log(`Fetching Google Fonts API: ${url.replace(apiKey, '[REDACTED]')}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Google Fonts API responded with status ${response.status}`);
      }

      const data = await response.json() as {
        kind: string;
        items: Array<{
          family: string;
          category: string;
          variants: string[];
          subsets: string[];
          version: string;
          lastModified: string;
          files: Record<string, string>;
        }>;
      };

      // Group fonts by category for easier frontend processing
      const fontsByCategory: Record<string, string[]> = {
        'serif': [],
        'sans-serif': [],
        'display': [],
        'handwriting': [],
        'monospace': []
      };

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format from Google Fonts API');
      }

      // Get the requested font set (if specified)
      const fontSet = req.query.fontSet as string;

      // Define popular and trending sets of fonts
      const fontSets: Record<string, string[]> = {
        'popular': ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald', 'Raleway', 'Nunito', 
                    'Poppins', 'Ubuntu', 'Playfair Display', 'Merriweather', 'Roboto Condensed'],
        'display': ['Anton', 'Bebas Neue', 'Archivo Black', 'Bangers', 'Bungee', 'Fascinate', 
                    'Lobster', 'Permanent Marker', 'Righteous', 'Russo One'],
        'handwriting': ['Dancing Script', 'Pacifico', 'Caveat', 'Satisfy', 'Great Vibes', 'Kaushan Script',
                      'Sacramento', 'Yellowtail', 'Allura', 'Courgette'],
        'monospace': ['Roboto Mono', 'Source Code Pro', 'Fira Mono', 'Space Mono', 'Ubuntu Mono',
                     'PT Mono', 'Courier Prime', 'IBM Plex Mono', 'Inconsolata', 'JetBrains Mono']
      };

      // Filter fonts by set if requested
      let filteredItems = [...data.items];
      if (fontSet && fontSets[fontSet]) {
        // Only keep fonts from the requested set
        filteredItems = filteredItems.filter(font => 
          fontSets[fontSet].includes(font.family)
        );
      } else if (category) {
        // Filter by category if no specific set was requested
        filteredItems = filteredItems.filter(font => 
          font.category?.toLowerCase() === category.toLowerCase()
        );
      }

      // Limit to 1000 fonts for better performance
      const limitedItems = filteredItems.slice(0, 1000);

      // Create a simplified font list with just the info we need
      const simplifiedFonts = limitedItems.map((font) => {
        const category = font.category?.toLowerCase() || 'unknown';
        const fontFamily = font.family;

        // Add to category lists
        if (fontsByCategory[category]) {
          fontsByCategory[category].push(fontFamily);
        } else {
          // In case there's a category we didn't anticipate
          fontsByCategory[category] = [fontFamily];
        }

        return {
          family: fontFamily,
          category: category,
          variants: font.variants || ['regular'],
          lastModified: font.lastModified,
          subsets: font.subsets || ['latin'],
          version: font.version
        };
      });

      res.json({
        fonts: simplifiedFonts,
        categories: fontsByCategory,
        total: simplifiedFonts.length
      });
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      res.status(500).json({ message: "Failed to fetch Google Fonts" });
    }
  });

  // Add endpoint to trigger font scanning
  app.post('/fonts/scan', async (req, res) => {
    try {
      console.log('Manually triggered font scan');

      // Run the scan-fonts.js script
      exec('node scan-fonts.js', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error scanning fonts: ${error.message}`);
          return res.status(500).json({ error: error.message });
        }

        console.log(`Font scan output: ${stdout}`);

        if (stderr) {
          console.warn(`Font scan warnings: ${stderr}`);
        }

        // Ensure the public directory exists
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        // Copy fonts.json to public directory for client access
        try {
          const fontsJsonPath = path.join(process.cwd(), 'fonts.json');
          const publicFontsJsonPath = path.join(publicDir, 'fonts.json');

          if (fs.existsSync(fontsJsonPath)) {
            fs.copyFileSync(fontsJsonPath, publicFontsJsonPath);
            console.log('Copied fonts.json to public directory');
          }
        } catch (copyError) {
          console.error('Error copying fonts.json:', copyError);
        }

        return res.json({ success: true, message: 'Fonts scanned successfully' });
      });
    } catch (error) {
      console.error('Error in font scan endpoint:', error);
      return res.status(500).json({ error: 'Failed to scan fonts' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
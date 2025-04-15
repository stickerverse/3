import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Create a simplified font list with just the info we need
      const simplifiedFonts = data.items.map((font) => {
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

  const httpServer = createServer(app);

  return httpServer;
}

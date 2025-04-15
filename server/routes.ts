import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import fetch from "node-fetch";

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
  
  // Get Google Fonts
  app.get("/api/fonts", async (req, res) => {
    try {
      const apiKey = process.env.GOOGLE_FONTS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "Google Fonts API key not configured" });
      }
      
      const sort = req.query.sort || 'popularity';
      const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=${sort}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Google Fonts API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Group fonts by category for easier frontend processing
      const fontsByCategory: Record<string, string[]> = {
        'serif': [],
        'sans-serif': [],
        'display': [],
        'handwriting': [],
        'monospace': []
      };
      
      // Create a simplified font list with just the info we need
      const simplifiedFonts = data.items.map((font: any) => {
        const category = font.category.toLowerCase();
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
          variants: font.variants,
        };
      });
      
      res.json({
        fonts: simplifiedFonts,
        categories: fontsByCategory
      });
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      res.status(500).json({ message: "Failed to fetch Google Fonts" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

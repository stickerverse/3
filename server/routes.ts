import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

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

  const httpServer = createServer(app);

  return httpServer;
}

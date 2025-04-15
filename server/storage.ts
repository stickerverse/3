import { users, type User, type InsertUser, 
  designs, type Design, type InsertDesign,
  vinylSizes, type VinylSize, type InsertVinylSize,
  vinylMaterials, type VinylMaterial, type InsertVinylMaterial 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Design CRUD methods
  getDesign(id: number): Promise<Design | undefined>;
  getAllDesigns(): Promise<Design[]>;
  createDesign(design: { name: string; data: string; userId?: number; sizeId?: number; materialId?: number; dimensions?: { width: number, height: number } }): Promise<Design>;
  updateDesign(id: number, design: { name: string; data: string; sizeId?: number; materialId?: number; dimensions?: { width: number, height: number } }): Promise<Design | undefined>;
  deleteDesign(id: number): Promise<boolean>;
  
  // Vinyl size methods
  getVinylSize(id: number): Promise<VinylSize | undefined>;
  getAllVinylSizes(): Promise<VinylSize[]>;
  getDefaultVinylSize(): Promise<VinylSize | undefined>;
  createVinylSize(size: InsertVinylSize): Promise<VinylSize>;
  updateVinylSize(id: number, size: Partial<InsertVinylSize>): Promise<VinylSize | undefined>;
  deleteVinylSize(id: number): Promise<boolean>;
  
  // Vinyl material methods
  getVinylMaterial(id: number): Promise<VinylMaterial | undefined>;
  getAllVinylMaterials(): Promise<VinylMaterial[]>;
  getDefaultVinylMaterial(): Promise<VinylMaterial | undefined>;
  createVinylMaterial(material: InsertVinylMaterial): Promise<VinylMaterial>;
  updateVinylMaterial(id: number, material: Partial<InsertVinylMaterial>): Promise<VinylMaterial | undefined>;
  deleteVinylMaterial(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Design CRUD methods
  async getDesign(id: number): Promise<Design | undefined> {
    const [design] = await db.select().from(designs).where(eq(designs.id, id));
    return design || undefined;
  }
  
  async getAllDesigns(): Promise<Design[]> {
    return await db.select().from(designs);
  }
  
  async createDesign(design: { name: string; data: string; userId?: number; sizeId?: number; materialId?: number; dimensions?: { width: number, height: number } }): Promise<Design> {
    const now = new Date().toISOString();
    
    const [newDesign] = await db
      .insert(designs)
      .values({
        name: design.name,
        data: design.data,
        userId: design.userId || null,
        sizeId: design.sizeId || null,
        materialId: design.materialId || null,
        dimensions: design.dimensions || null,
        createdAt: now
      })
      .returning();
      
    return newDesign;
  }
  
  async updateDesign(id: number, design: { name: string; data: string; sizeId?: number; materialId?: number; dimensions?: { width: number, height: number } }): Promise<Design | undefined> {
    const [updatedDesign] = await db
      .update(designs)
      .set({
        name: design.name,
        data: design.data,
        sizeId: design.sizeId !== undefined ? design.sizeId : undefined,
        materialId: design.materialId !== undefined ? design.materialId : undefined,
        dimensions: design.dimensions !== undefined ? design.dimensions : undefined
      })
      .where(eq(designs.id, id))
      .returning();
      
    return updatedDesign || undefined;
  }
  
  async deleteDesign(id: number): Promise<boolean> {
    const result = await db
      .delete(designs)
      .where(eq(designs.id, id))
      .returning({ id: designs.id });
      
    return result.length > 0;
  }
  
  // Vinyl Size methods
  async getVinylSize(id: number): Promise<VinylSize | undefined> {
    const [size] = await db.select().from(vinylSizes).where(eq(vinylSizes.id, id));
    return size || undefined;
  }
  
  async getAllVinylSizes(): Promise<VinylSize[]> {
    return await db.select().from(vinylSizes);
  }
  
  async getDefaultVinylSize(): Promise<VinylSize | undefined> {
    const [size] = await db.select().from(vinylSizes).where(eq(vinylSizes.default, true));
    return size || undefined;
  }
  
  async createVinylSize(size: InsertVinylSize): Promise<VinylSize> {
    // If this size is default, unset any existing defaults
    if (size.default) {
      await db
        .update(vinylSizes)
        .set({ default: false })
        .where(eq(vinylSizes.default, true));
    }
    
    const [newSize] = await db
      .insert(vinylSizes)
      .values(size)
      .returning();
    return newSize;
  }
  
  async updateVinylSize(id: number, size: Partial<InsertVinylSize>): Promise<VinylSize | undefined> {
    // If this size is being set as default, unset any existing defaults
    if (size.default) {
      await db
        .update(vinylSizes)
        .set({ default: false })
        .where(eq(vinylSizes.default, true));
    }
    
    const [updatedSize] = await db
      .update(vinylSizes)
      .set(size)
      .where(eq(vinylSizes.id, id))
      .returning();
    return updatedSize;
  }
  
  async deleteVinylSize(id: number): Promise<boolean> {
    const result = await db
      .delete(vinylSizes)
      .where(eq(vinylSizes.id, id))
      .returning({ id: vinylSizes.id });
    return result.length > 0;
  }
  
  // Vinyl Material methods
  async getVinylMaterial(id: number): Promise<VinylMaterial | undefined> {
    const [material] = await db.select().from(vinylMaterials).where(eq(vinylMaterials.id, id));
    return material || undefined;
  }
  
  async getAllVinylMaterials(): Promise<VinylMaterial[]> {
    return await db.select().from(vinylMaterials);
  }
  
  async getDefaultVinylMaterial(): Promise<VinylMaterial | undefined> {
    const [material] = await db.select().from(vinylMaterials).where(eq(vinylMaterials.default, true));
    return material || undefined;
  }
  
  async createVinylMaterial(material: InsertVinylMaterial): Promise<VinylMaterial> {
    // If this material is default, unset any existing defaults
    if (material.default) {
      await db
        .update(vinylMaterials)
        .set({ default: false })
        .where(eq(vinylMaterials.default, true));
    }
    
    const [newMaterial] = await db
      .insert(vinylMaterials)
      .values(material)
      .returning();
    return newMaterial;
  }
  
  async updateVinylMaterial(id: number, material: Partial<InsertVinylMaterial>): Promise<VinylMaterial | undefined> {
    // If this material is being set as default, unset any existing defaults
    if (material.default) {
      await db
        .update(vinylMaterials)
        .set({ default: false })
        .where(eq(vinylMaterials.default, true));
    }
    
    const [updatedMaterial] = await db
      .update(vinylMaterials)
      .set(material)
      .where(eq(vinylMaterials.id, id))
      .returning();
    return updatedMaterial;
  }
  
  async deleteVinylMaterial(id: number): Promise<boolean> {
    const result = await db
      .delete(vinylMaterials)
      .where(eq(vinylMaterials.id, id))
      .returning({ id: vinylMaterials.id });
    return result.length > 0;
  }
}

// Keep a memory storage option for development purposes
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private designs: Map<number, Design>;
  private vinylSizes: Map<number, VinylSize>;
  private vinylMaterials: Map<number, VinylMaterial>;
  private userCurrentId: number;
  private designCurrentId: number;
  private vinylSizeCurrentId: number;
  private vinylMaterialCurrentId: number;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.vinylSizes = new Map();
    this.vinylMaterials = new Map();
    this.userCurrentId = 1;
    this.designCurrentId = 1;
    this.vinylSizeCurrentId = 1;
    this.vinylMaterialCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Design CRUD methods
  async getDesign(id: number): Promise<Design | undefined> {
    return this.designs.get(id);
  }
  
  async getAllDesigns(): Promise<Design[]> {
    return Array.from(this.designs.values());
  }
  
  async createDesign(design: { name: string; data: string; userId?: number; sizeId?: number; materialId?: number; dimensions?: { width: number, height: number } }): Promise<Design> {
    const id = this.designCurrentId++;
    const now = new Date().toISOString();
    
    const newDesign: Design = {
      id,
      name: design.name,
      data: design.data,
      userId: design.userId || null,
      sizeId: design.sizeId || null,
      materialId: design.materialId || null,
      dimensions: design.dimensions || null,
      createdAt: now
    };
    
    this.designs.set(id, newDesign);
    return newDesign;
  }
  
  async updateDesign(id: number, design: { name: string; data: string; sizeId?: number; materialId?: number; dimensions?: { width: number, height: number } }): Promise<Design | undefined> {
    const existingDesign = this.designs.get(id);
    
    if (!existingDesign) {
      return undefined;
    }
    
    const updatedDesign: Design = {
      ...existingDesign,
      name: design.name,
      data: design.data,
      sizeId: design.sizeId !== undefined ? design.sizeId : existingDesign.sizeId,
      materialId: design.materialId !== undefined ? design.materialId : existingDesign.materialId,
      dimensions: design.dimensions !== undefined ? design.dimensions : existingDesign.dimensions
    };
    
    this.designs.set(id, updatedDesign);
    return updatedDesign;
  }
  
  async deleteDesign(id: number): Promise<boolean> {
    return this.designs.delete(id);
  }
  
  // Vinyl Size methods
  async getVinylSize(id: number): Promise<VinylSize | undefined> {
    return this.vinylSizes.get(id);
  }
  
  async getAllVinylSizes(): Promise<VinylSize[]> {
    return Array.from(this.vinylSizes.values());
  }
  
  async getDefaultVinylSize(): Promise<VinylSize | undefined> {
    return Array.from(this.vinylSizes.values()).find(size => size.default);
  }
  
  async createVinylSize(size: InsertVinylSize): Promise<VinylSize> {
    const id = this.vinylSizeCurrentId++;
    
    // If this size is default, unset any existing defaults
    if (size.default) {
      for (const [sizeId, existingSize] of this.vinylSizes.entries()) {
        if (existingSize.default) {
          this.vinylSizes.set(sizeId, { ...existingSize, default: false });
        }
      }
    }
    
    const newSize: VinylSize = { ...size, id };
    this.vinylSizes.set(id, newSize);
    return newSize;
  }
  
  async updateVinylSize(id: number, size: Partial<InsertVinylSize>): Promise<VinylSize | undefined> {
    const existingSize = this.vinylSizes.get(id);
    
    if (!existingSize) {
      return undefined;
    }
    
    // If this size is being set as default, unset any existing defaults
    if (size.default) {
      for (const [sizeId, existingSize] of this.vinylSizes.entries()) {
        if (existingSize.default && sizeId !== id) {
          this.vinylSizes.set(sizeId, { ...existingSize, default: false });
        }
      }
    }
    
    const updatedSize: VinylSize = { ...existingSize, ...size };
    this.vinylSizes.set(id, updatedSize);
    return updatedSize;
  }
  
  async deleteVinylSize(id: number): Promise<boolean> {
    return this.vinylSizes.delete(id);
  }
  
  // Vinyl Material methods
  async getVinylMaterial(id: number): Promise<VinylMaterial | undefined> {
    return this.vinylMaterials.get(id);
  }
  
  async getAllVinylMaterials(): Promise<VinylMaterial[]> {
    return Array.from(this.vinylMaterials.values());
  }
  
  async getDefaultVinylMaterial(): Promise<VinylMaterial | undefined> {
    return Array.from(this.vinylMaterials.values()).find(material => material.default);
  }
  
  async createVinylMaterial(material: InsertVinylMaterial): Promise<VinylMaterial> {
    const id = this.vinylMaterialCurrentId++;
    
    // If this material is default, unset any existing defaults
    if (material.default) {
      for (const [materialId, existingMaterial] of this.vinylMaterials.entries()) {
        if (existingMaterial.default) {
          this.vinylMaterials.set(materialId, { ...existingMaterial, default: false });
        }
      }
    }
    
    const newMaterial: VinylMaterial = { ...material, id };
    this.vinylMaterials.set(id, newMaterial);
    return newMaterial;
  }
  
  async updateVinylMaterial(id: number, material: Partial<InsertVinylMaterial>): Promise<VinylMaterial | undefined> {
    const existingMaterial = this.vinylMaterials.get(id);
    
    if (!existingMaterial) {
      return undefined;
    }
    
    // If this material is being set as default, unset any existing defaults
    if (material.default) {
      for (const [materialId, existingMaterial] of this.vinylMaterials.entries()) {
        if (existingMaterial.default && materialId !== id) {
          this.vinylMaterials.set(materialId, { ...existingMaterial, default: false });
        }
      }
    }
    
    const updatedMaterial: VinylMaterial = { ...existingMaterial, ...material };
    this.vinylMaterials.set(id, updatedMaterial);
    return updatedMaterial;
  }
  
  async deleteVinylMaterial(id: number): Promise<boolean> {
    return this.vinylMaterials.delete(id);
  }
}

// Use the database storage for persistent data
export const storage = new DatabaseStorage();

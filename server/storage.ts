import { users, type User, type InsertUser, designs, type Design, type InsertDesign } from "@shared/schema";
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
  createDesign(design: { name: string; data: string; userId?: number }): Promise<Design>;
  updateDesign(id: number, design: { name: string; data: string }): Promise<Design | undefined>;
  deleteDesign(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
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
  
  async createDesign(design: { name: string; data: string; userId?: number }): Promise<Design> {
    const now = new Date().toISOString();
    
    const [newDesign] = await db
      .insert(designs)
      .values({
        name: design.name,
        data: design.data,
        userId: design.userId || null,
        createdAt: now
      })
      .returning();
      
    return newDesign;
  }
  
  async updateDesign(id: number, design: { name: string; data: string }): Promise<Design | undefined> {
    const [updatedDesign] = await db
      .update(designs)
      .set({
        name: design.name,
        data: design.data
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
}

// Keep a memory storage option for development purposes
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private designs: Map<number, Design>;
  private userCurrentId: number;
  private designCurrentId: number;

  constructor() {
    this.users = new Map();
    this.designs = new Map();
    this.userCurrentId = 1;
    this.designCurrentId = 1;
  }

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
  
  async createDesign(design: { name: string; data: string; userId?: number }): Promise<Design> {
    const id = this.designCurrentId++;
    const now = new Date().toISOString();
    
    const newDesign: Design = {
      id,
      name: design.name,
      data: design.data,
      userId: design.userId || null,
      createdAt: now
    };
    
    this.designs.set(id, newDesign);
    return newDesign;
  }
  
  async updateDesign(id: number, design: { name: string; data: string }): Promise<Design | undefined> {
    const existingDesign = this.designs.get(id);
    
    if (!existingDesign) {
      return undefined;
    }
    
    const updatedDesign: Design = {
      ...existingDesign,
      name: design.name,
      data: design.data
    };
    
    this.designs.set(id, updatedDesign);
    return updatedDesign;
  }
  
  async deleteDesign(id: number): Promise<boolean> {
    return this.designs.delete(id);
  }
}

// Use the database storage for persistent data
export const storage = new DatabaseStorage();

import { users, type User, type InsertUser, designs, type Design, type InsertDesign } from "@shared/schema";

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

export const storage = new MemStorage();

import { storage } from "../server/storage";

// Sample vinyl sizes ranging from small to large
const vinylSizes = [
  {
    name: "Small Decal",
    width: 75,
    height: 75,
    description: "Perfect for small logos, emblems, and badges",
    recommendedFor: "Laptops, water bottles, phone cases",
    default: true
  },
  {
    name: "Medium Decal",
    width: 150,
    height: 150,
    description: "Versatile size for most applications",
    recommendedFor: "Car windows, laptops, tablets",
    default: false
  },
  {
    name: "Large Decal",
    width: 300,
    height: 300,
    description: "High-visibility designs with maximum impact",
    recommendedFor: "Car doors, windows, large surfaces",
    default: false
  },
  {
    name: "Bumper Sticker",
    width: 250,
    height: 75,
    description: "Classic rectangular bumper sticker shape",
    recommendedFor: "Car bumpers, toolboxes, flat surfaces",
    default: false
  },
  {
    name: "Laptop Size",
    width: 100,
    height: 100,
    description: "Perfect size for laptop decoration",
    recommendedFor: "Laptops, notebooks, smooth surfaces",
    default: false
  },
  {
    name: "Name Label",
    width: 75,
    height: 25,
    description: "Small rectangular shape for name tags",
    recommendedFor: "Personal items, equipment, tools",
    default: false
  }
];

// Sample vinyl materials for different applications
const vinylMaterials = [
  {
    name: "Standard Indoor Vinyl",
    type: "indoor",
    color: "white",
    durability: "medium",
    description: "General purpose vinyl for indoor applications. 3-5 year lifespan in normal conditions.",
    default: true
  },
  {
    name: "Premium Outdoor Vinyl",
    type: "outdoor",
    color: "white",
    durability: "high",
    description: "Weather-resistant vinyl with UV protection. 5-7 year outdoor lifespan.",
    default: false
  },
  {
    name: "Transparent Vinyl",
    type: "indoor",
    color: "clear",
    durability: "medium",
    description: "Clear vinyl that lets background show through. Ideal for glass and windows.",
    default: false
  },
  {
    name: "Metallic Vinyl",
    type: "specialty",
    color: "silver",
    durability: "medium",
    description: "Shimmering metallic finish for eye-catching designs.",
    default: false
  },
  {
    name: "Holographic Vinyl",
    type: "specialty",
    color: "rainbow",
    durability: "medium",
    description: "Rainbow holographic effect that changes with viewing angle.",
    default: false
  },
  {
    name: "Removable Vinyl",
    type: "indoor",
    color: "white",
    durability: "low",
    description: "Easy to apply and remove without residue. Perfect for temporary applications.",
    default: false
  },
  {
    name: "Permanent Outdoor Vinyl",
    type: "outdoor",
    color: "white",
    durability: "high",
    description: "Extra strong adhesive for permanent outdoor applications. 7+ year lifespan.",
    default: false
  },
  {
    name: "Heat Transfer Vinyl",
    type: "specialty",
    color: "various",
    durability: "medium",
    description: "Applied with heat to fabric for t-shirts and textile applications.",
    default: false
  }
];

async function initializeData() {
  try {
    console.log("Initializing vinyl sizes...");
    
    // Check if sizes already exist
    const existingSizes = await storage.getAllVinylSizes();
    if (existingSizes.length === 0) {
      for (const size of vinylSizes) {
        await storage.createVinylSize(size);
        console.log(`Created size: ${size.name}`);
      }
    } else {
      console.log(`Skipping size initialization: ${existingSizes.length} sizes already exist`);
    }
    
    console.log("Initializing vinyl materials...");
    
    // Check if materials already exist
    const existingMaterials = await storage.getAllVinylMaterials();
    if (existingMaterials.length === 0) {
      for (const material of vinylMaterials) {
        await storage.createVinylMaterial(material);
        console.log(`Created material: ${material.name}`);
      }
    } else {
      console.log(`Skipping material initialization: ${existingMaterials.length} materials already exist`);
    }
    
    console.log("Data initialization complete!");
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}

// Run the initialization
initializeData().then(() => {
  console.log("Script execution complete");
}).catch(error => {
  console.error("Script failed:", error);
});
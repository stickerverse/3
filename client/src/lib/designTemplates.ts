import { DesignTemplate } from "@/types/vinyl";

// Pre-made templates for quick starting points
export const designTemplates: DesignTemplate[] = [
  { 
    name: "Car Decal", 
    font: "Anton", 
    fontSize: 60, 
    color: "#FFFFFF", 
    colorName: "White",
    effect: "outline", 
    strokeWidth: 2,
    strokeColor: "#000000",
    bgColor: "#1e293b"
  },
  { 
    name: "Business Name", 
    font: "Montserrat", 
    fontSize: 45, 
    color: "#2d3436", 
    colorName: "Dark Gray",
    effect: "none", 
    strokeWidth: 0,
    bgColor: "#f8fafc"
  },
  { 
    name: "Laptop Sticker", 
    font: "Permanent Marker", 
    fontSize: 36, 
    color: "#6c5ce7", 
    colorName: "Purple",
    effect: "none", 
    strokeWidth: 0,
    bgColor: "#f1f5f9"
  },
  { 
    name: "Window Sign", 
    font: "Bebas Neue", 
    fontSize: 72, 
    color: "#e74c3c", 
    colorName: "Red",
    effect: "shadow", 
    strokeWidth: 0,
    bgColor: "#e2e8f0"
  },
  { 
    name: "Sports Jersey", 
    font: "Black Ops One", 
    fontSize: 54, 
    color: "#f1c40f", 
    colorName: "Yellow",
    effect: "outline", 
    strokeWidth: 3,
    strokeColor: "#2c3e50",
    bgColor: "#334155"
  },
  { 
    name: "Modern Logo", 
    font: "Oswald", 
    fontSize: 48, 
    color: "#0078D7", 
    colorName: "Blue",
    effect: "none", 
    strokeWidth: 0,
    bgColor: "#f8fafc"
  },
  { 
    name: "Retro Style", 
    font: "Racing Sans One", 
    fontSize: 42, 
    color: "#FDA22A", 
    colorName: "Orange",
    effect: "retro", 
    strokeWidth: 1,
    strokeColor: "#000000",
    bgColor: "#cbd5e1"
  },
  { 
    name: "Kids Decal", 
    font: "Fredoka One", 
    fontSize: 36, 
    color: "#00D572", 
    colorName: "Green",
    effect: "glow", 
    strokeWidth: 0,
    bgColor: "#f1f5f9"
  }
];

// Get a template by name
export function getTemplateByName(name: string): DesignTemplate | undefined {
  return designTemplates.find(template => template.name === name);
}

// Get all template names
export function getTemplateNames(): string[] {
  return designTemplates.map(template => template.name);
}

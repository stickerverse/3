// Define text effects options with names and icons
export const textEffects = {
  none: { name: "None", icon: "✓" },
  shadow: { name: "Shadow", icon: "🌑" },
  outline: { name: "Outline", icon: "◯" },
  glow: { name: "Glow", icon: "✨" },
  gradient: { name: "Gradient", icon: "🌈" },
  distressed: { name: "Distressed", icon: "💢" },
  retro: { name: "Retro", icon: "📺" },
  metallic: { name: "Metallic", icon: "⚙️" }
};

// Function to get text effect by name
export function getTextEffect(name: string) {
  return textEffects[name as keyof typeof textEffects] || textEffects.none;
}

// Function to get all text effect names
export function getTextEffectNames() {
  return Object.keys(textEffects);
}

// Function to get all text effects
export function getAllTextEffects() {
  return textEffects;
}

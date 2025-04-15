import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// Mock font data for fallback if API key is not available
const getMockFontData = () => {
  return {
    fonts: [
      { family: "Roboto", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Open Sans", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Lato", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Montserrat", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Oswald", category: "sans-serif", variants: ["regular", "700"] },
      { family: "Source Sans Pro", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Raleway", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Nunito", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Playfair Display", category: "serif", variants: ["regular", "italic", "700"] },
      { family: "Merriweather", category: "serif", variants: ["regular", "italic", "700"] },
      { family: "Lora", category: "serif", variants: ["regular", "italic", "700"] },
      { family: "Roboto Slab", category: "serif", variants: ["regular", "700"] },
      { family: "Poppins", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Ubuntu", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Roboto Condensed", category: "sans-serif", variants: ["regular", "italic", "700"] },
      { family: "Roboto Mono", category: "monospace", variants: ["regular", "italic", "700"] },
      { family: "Source Code Pro", category: "monospace", variants: ["regular", "700"] },
      { family: "Fira Mono", category: "monospace", variants: ["regular", "500", "700"] },
      { family: "Anton", category: "display", variants: ["regular"] },
      { family: "Bebas Neue", category: "display", variants: ["regular"] },
      { family: "Archivo Black", category: "display", variants: ["regular"] },
      { family: "Dancing Script", category: "handwriting", variants: ["regular", "700"] },
      { family: "Pacifico", category: "handwriting", variants: ["regular"] },
      { family: "Caveat", category: "handwriting", variants: ["regular", "700"] }
    ]
  };
};

/**
 * GET /api/fonts
 * Returns a list of Google Fonts
 */
router.get("/", async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_FONTS_API_KEY;
    
    if (!apiKey) {
      console.log("No Google Fonts API key found, using mock data");
      return res.status(200).json(getMockFontData());
    }
    
    // Log message to identify our requests in the server logs
    console.log(`Fetching Google Fonts API: https://www.googleapis.com/webfonts/v1/webfonts?key=[REDACTED]&sort=popularity&capability=WOFF2`);
    
    // Fetch from Google Fonts API
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity&capability=WOFF2`
    );
    
    if (!response.ok) {
      throw new Error(`Google Fonts API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response to our expected format
    const fonts = data.items.map((item: any) => ({
      family: item.family,
      category: item.category,
      variants: item.variants
    }));
    
    return res.status(200).json({ fonts });
  } catch (error) {
    console.error("Error fetching Google Fonts:", error);
    // Fallback to mock data if API fails
    return res.status(200).json(getMockFontData());
  }
});

export default router;
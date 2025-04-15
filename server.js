// server.js - ES Module version
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(__dirname));
app.use("/fonts", express.static(path.join(__dirname, "fonts")));

// Serve the font previewer HTML file as the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Font previewer app listening at http://localhost:${port}`);
  console.log(`Open your Replit preview to view the application`);
});

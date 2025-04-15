import googleFontsService from './googleFontsService';

interface GitHubFileInfo {
  name: string;
  path: string;
  download_url: string;
  type: string;
}

class GitHubFontService {
  private repoUrl: string = 'https://api.github.com/repos/stickerverse/Fonts1/contents';
  private fontsCache: GitHubFileInfo[] = [];
  private loadedRepos: Set<string> = new Set();
  
  /**
   * Fetches font files from a GitHub repository
   * @param repoPath Optional - specific path within the repository
   */
  async fetchFontsFromGitHub(repoPath: string = ''): Promise<GitHubFileInfo[]> {
    try {
      const url = `${this.repoUrl}${repoPath ? '/' + repoPath : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch from GitHub: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter for font files only
      const fontFiles = data.filter((file: GitHubFileInfo) => {
        if (file.type === 'dir') {
          return false; // We'll handle directories separately
        }
        
        const lowerName = file.name.toLowerCase();
        return lowerName.endsWith('.ttf') || 
               lowerName.endsWith('.otf') || 
               lowerName.endsWith('.woff') || 
               lowerName.endsWith('.woff2');
      });
      
      // Cache the results
      this.fontsCache = [...this.fontsCache, ...fontFiles];
      
      // Also search in directories if found
      const directories = data.filter((file: GitHubFileInfo) => file.type === 'dir');
      for (const dir of directories) {
        await this.fetchFontsFromGitHub(dir.path);
      }
      
      return this.fontsCache;
    } catch (error) {
      console.error('Error fetching fonts from GitHub:', error);
      return [];
    }
  }
  
  /**
   * Load all fonts from a GitHub repository
   * @param repoUrl Optional - specific repository URL (default is stickerverse/Fonts1)
   */
  async loadFontsFromGitHub(repoUrl?: string): Promise<string[]> {
    if (repoUrl) {
      this.repoUrl = `https://api.github.com/repos/${repoUrl}/contents`;
    }
    
    // If we've already loaded this repo, don't reload
    if (this.loadedRepos.has(this.repoUrl)) {
      return this.getFontNames();
    }
    
    // Clear cache before loading new repo
    this.fontsCache = [];
    
    // Fetch font files from GitHub
    const fontFiles = await this.fetchFontsFromGitHub();
    
    // Load each font into the application
    const loadedFonts: string[] = [];
    
    for (const file of fontFiles) {
      try {
        // Generate a font name from the filename
        const fontName = this.getFontNameFromFilename(file.name);
        
        // Register the font with the Google Fonts service
        const success = googleFontsService.registerLocalFont(fontName, file.download_url);
        
        if (success) {
          loadedFonts.push(fontName);
        }
      } catch (error) {
        console.error(`Error loading font ${file.name}:`, error);
      }
    }
    
    // Mark this repo as loaded
    this.loadedRepos.add(this.repoUrl);
    
    return loadedFonts;
  }
  
  /**
   * Extracts a font name from a filename
   */
  private getFontNameFromFilename(filename: string): string {
    // Remove extension
    let fontName = filename.split('.').slice(0, -1).join('.');
    
    // Replace underscores and hyphens with spaces for better display
    fontName = fontName.replace(/[_-]/g, ' ');
    
    // Convert to title case
    fontName = fontName.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
    
    return fontName;
  }
  
  /**
   * Get names of all loaded fonts
   */
  getFontNames(): string[] {
    return this.fontsCache.map(file => this.getFontNameFromFilename(file.name));
  }
  
  /**
   * Get font files information
   */
  getFontFiles(): GitHubFileInfo[] {
    return this.fontsCache;
  }
}

export default new GitHubFontService();
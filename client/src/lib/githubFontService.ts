import googleFontsService from './googleFontsService';

interface GitHubFileInfo {
  name: string;
  path: string;
  download_url: string;
  type: string;
}

class GitHubFontService {
  private repoUrl: string = 'https://api.github.com/repos/stickerverse/Fonts1/contents';
  private repoOwner: string = 'stickerverse';
  private repoName: string = 'Fonts1';
  private repoBranch: string = 'main';
  private fontsCache: GitHubFileInfo[] = [];
  private loadedRepos: Set<string> = new Set();
  private FONT_EXTENSIONS = ['.ttf', '.otf', '.woff', '.woff2'];
  
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
        return this.FONT_EXTENSIONS.some(ext => lowerName.endsWith(ext));
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
      // Try fallback method if GitHub API fails
      return this.useFallbackMethod();
    }
  }
  
  /**
   * Fallback method to try accessing fonts through jsdelivr CDN
   * This is useful when GitHub API is rate limited
   */
  private async useFallbackMethod(): Promise<GitHubFileInfo[]> {
    console.log('Using fallback method to load GitHub fonts');
    const fontPaths = this.generatePotentialFontPaths();
    const foundFonts: GitHubFileInfo[] = [];
    
    for (const fontPath of fontPaths) {
      // Construct the jsdelivr URL
      const cdnUrl = `https://cdn.jsdelivr.net/gh/${this.repoOwner}/${this.repoName}@${this.repoBranch}/${fontPath}`;
      
      try {
        // Check if the font exists by doing a HEAD request
        const exists = await this.checkFontExists(cdnUrl);
        
        if (exists) {
          // Extract font name from path
          const name = fontPath.split('/').pop() || '';
          
          foundFonts.push({
            name,
            path: fontPath,
            download_url: cdnUrl,
            type: 'file'
          });
          
          console.log(`Found font via fallback method: ${name}`);
        }
      } catch (error) {
        // Skip failed fonts silently
      }
    }
    
    // Cache the results
    this.fontsCache = [...this.fontsCache, ...foundFonts];
    return foundFonts;
  }
  
  /**
   * Check if a font file exists at the given URL
   */
  private async checkFontExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Generate potential font file paths to try
   * Uses common patterns and directories that might exist in font repositories
   */
  private generatePotentialFontPaths(): string[] {
    const paths: string[] = [];
    
    // Try some common font names with different extensions
    const fontNames = [
      'Arial', 'Helvetica', 'Times', 'Georgia', 'Verdana', 'Courier', 
      'Impact', 'Comic', 'Trebuchet', 'Palatino', 'Garamond', 'Bookman',
      'Avant', 'Century', 'Futura', 'Geneva', 'Helvetica', 'Monaco',
      'Font', 'Regular', 'Bold', 'Medium', 'Thin', 'Light', 'Heavy',
      'Italic', 'Condensed', 'Extended', 'Mono', 'Sans', 'Serif',
      'Display', 'Title', 'Text', 'Heading', 'Body', 'Base'
    ];
    
    // Try common directories
    const commonDirs = ['', 'fonts/', 'font/', 'assets/', 'assets/fonts/', 'static/fonts/', 'public/fonts/'];
    
    // Generate all combinations
    for (const dir of commonDirs) {
      for (const name of fontNames) {
        for (const ext of this.FONT_EXTENSIONS) {
          paths.push(`${dir}${name}${ext}`);
          paths.push(`${dir}${name.toLowerCase()}${ext}`);
          
          // Add some variants
          paths.push(`${dir}${name}-Regular${ext}`);
          paths.push(`${dir}${name}-Bold${ext}`);
          paths.push(`${dir}${name}-Italic${ext}`);
        }
      }
    }
    
    return paths;
  }
  
  /**
   * Load all fonts from a GitHub repository
   * @param repoUrl Optional - specific repository URL (default is stickerverse/Fonts1)
   */
  async loadFontsFromGitHub(repoUrl?: string): Promise<string[]> {
    if (repoUrl) {
      // Parse the repository URL to extract owner and name
      const parts = repoUrl.split('/');
      if (parts.length >= 2) {
        this.repoOwner = parts[0];
        this.repoName = parts[1];
        this.repoUrl = `https://api.github.com/repos/${repoUrl}/contents`;
      }
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
        
        // Register the font with the Google Fonts service using the GitHub URL
        const success = googleFontsService.registerFontFromUrl(fontName, file.download_url);
        
        if (success) {
          loadedFonts.push(fontName);
          console.log(`Successfully loaded GitHub font: ${fontName}`);
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
    
    // Add filename hash to ensure uniqueness if two files have the same font name
    // This is particularly useful for font families with multiple variants
    const hash = this.simpleHash(filename);
    const uniqueFontName = `${fontName} [${hash}]`;
    
    return uniqueFontName;
  }
  
  /**
   * Create a simple hash string from a filename to use as an identifier
   */
  private simpleHash(str: string): string {
    // Extract only the first 4 characters of the filename for a simple identifier
    // This avoids weird-looking names but still differentiates variants
    return str.slice(0, 4);
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
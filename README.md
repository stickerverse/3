# Font Explorer for Vinyl Design Tool

A comprehensive React-based application for exploring, testing, and selecting fonts for vinyl design projects. This tool helps designers find and test the perfect typography for their vinyl cutting designs.

## Features

- **Local Font Library**: Browse and use all fonts from your local `/fonts` directory
- **Google Fonts Integration**: Access and search the entire Google Fonts catalog
- **Interactive Font Previewer**: Test fonts with your text before applying them to designs
- **Advanced Canvas Editing**: Built with Fabric.js for powerful design capabilities
- **Infinite Scrolling**: Effortlessly navigate through large font collections
- **Font Categories**: Filter fonts by type (sans-serif, serif, display, etc.)
- **Mobile-Responsive Design**: Works seamlessly across devices
- **Dark Mode Support**: For comfortable use in any lighting conditions

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/font-explorer-vinyl-design.git
cd font-explorer-vinyl-design
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Place font files in the `/fonts` directory (supports .ttf, .otf, .woff, .woff2)

4. Run the font scanner to index your local fonts
```bash
node scan-fonts.js
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Usage

1. **Select Text**: Add or select text elements on the canvas
2. **Browse Fonts**: Explore the local fonts or Google Fonts collection
3. **Preview & Apply**: Click on any font to preview and apply it to your selected text
4. **Customize**: Adjust size, color, and other properties through the toolbar

## Font Organization

The application automatically organizes fonts into the following categories:

- **Local Fonts**: All fonts from your `/fonts` directory
- **Google Fonts**: Organized by their respective categories (Sans Serif, Serif, Display, etc.)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Fonts API for providing access to their font catalog
- Fabric.js for the powerful canvas manipulation capabilities
- All font creators whose work makes this tool valuable
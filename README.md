# Kirsty's Worry Journal

A personal web application built to support a family member in managing and reframing worries through cognitive behavioral techniques.

## Overview

This is a private family project designed to help externalize and examine worries in a structured way. The application guides users through a process of identifying worries, examining evidence for and against them, and reflecting on their validity using rational thinking.

## Features

- **Local-First Privacy**: All data stays in the browser's localStorage - no servers, no accounts, no tracking
- **Worry Management**: Create, edit, and review worries at any time
- **Cognitive Reframing**: Structured approach to examine evidence for and against worries
- **Mobile-Friendly**: Responsive design works on phones, tablets, and desktops
- **Zero Dependencies**: Pure vanilla JavaScript with no framework dependencies

## Technical Implementation

### Architecture

The application is built as a Single Page Application (SPA) using vanilla JavaScript with ES6 modules. It requires no build process and can be served from any static file host.

### Project Structure

```
/
├── index.html              # Entry point
├── package.json            # Dev server configuration
├── src/
│   ├── app.js             # Main application bootstrap
│   ├── storage.js         # localStorage management
│   ├── router.js          # Hash-based routing
│   ├── utils.js           # Utility functions
│   └── components/
│       ├── landing.js     # Home page with worry list
│       ├── form.js        # Worry editing form
│       └── modal.js       # Delete confirmation modal
├── styles/
│   └── main.css           # All styling
└── favicons/              # App icons
```

### Core Technologies

- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern styling with CSS variables for theming
- **JavaScript (ES6+)** - Module-based architecture
- **localStorage** - Client-side data persistence

### Key Components

#### Storage Layer (`storage.js`)
- Manages all localStorage operations with error handling
- Schema versioning for future migrations
- Automatic cleanup of old empty worries (>24 hours)
- Corruption recovery with user notification
- Empty worry handling - allows creation for navigation but filters from display

#### Router (`router.js`)
- Simple hash-based routing (#/worry/:id)
- No external dependencies
- Handles navigation between landing and form pages

#### Form Component (`form.js`)
- Dynamic form with repeating fields for reasons
- Autosave with 400ms debounce
- Smart focus management to prevent scroll jumping
- Real-time summary generation
- Automatic feeling reset when content changes
- Helper text guidance based on user's reflection

#### Data Model

```javascript
{
  "id": "uuid",
  "title": "What are you worried about?",
  "reasonsFor": ["Evidence it might be real"],
  "reasonsAgainst": ["Evidence it's not real"],
  "feeling": "still" | "less" | null,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### Design Decisions

#### Why Vanilla JavaScript?
- **Simplicity**: No build tools, transpilers, or package management needed
- **Performance**: Small bundle size (~10KB JS) loads instantly
- **Longevity**: No framework churn or dependency updates
- **Maintainability**: Any developer can understand and modify the code

#### Why localStorage?
- **Privacy**: Data never leaves the device
- **Simplicity**: No backend, databases, or authentication needed
- **Reliability**: Works offline, no network dependencies
- **Cost**: Zero hosting costs beyond static files

#### Accessibility Features
- Full keyboard navigation support
- ARIA labels and semantic HTML
- Focus management for modals
- Screen reader compatible
- High contrast colors

### Browser Compatibility

Works on all modern browsers supporting:
- ES6 Modules
- localStorage
- CSS Variables
- CSS Grid/Flexbox

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile

### Development

#### Setup
```bash
# Install dev server (optional)
npm install

# Start development server
npm start
# Or for external access
npm run public
```

#### File Serving
The app can be served by any static file server:
- Python: `python -m http.server 8000`
- Node: `npx http-server`
- Or open index.html directly in a browser

### Deployment

The application can be deployed to any static hosting service:

#### GitHub Pages
1. Push to GitHub repository
2. Enable Pages in repository settings
3. Serves from `https://[username].github.io/[repository]/`

#### Netlify/Vercel
1. Connect repository
2. No build command needed
3. Publish directory: `/`

#### Traditional Hosting
Simply upload all files to any web server maintaining the directory structure.

### Security Considerations

- **No sensitive data transmission**: Everything stays local
- **XSS Protection**: All user input is escaped when rendered
- **No external dependencies**: No supply chain vulnerabilities
- **No cookies**: No tracking or session management
- **HTTPS recommended**: Though not required for functionality

### Future Enhancements

Potential improvements while maintaining simplicity:
- Export/import data for backup
- PWA support for offline mobile use
- Data encryption option
- Multiple user profiles (still local)
- Statistical insights on worry patterns

### License

This is a private family project. Please respect its personal nature.

### Acknowledgments

Built with love to support family mental health and wellbeing.
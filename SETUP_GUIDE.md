# NewsHub - Complete Setup & Configuration Guide

## What You Have

Your NewsHub project is a **modern, infinite-scrolling news feed application** with:

- **Backend**: Express.js server that aggregates RSS feeds from multiple news sources
- **Frontend**: React + Vite + Tailwind CSS for a beautiful, responsive UI
- **Features**: 
  - Source selection dashboard
  - Infinite scroll feed
  - Chronological sorting (newest first)
  - Image thumbnails
  - Modern, dark-themed UI

## Project Architecture

```
news-app-new/
├── backend/
│   ├── server.js              # Express server with RSS parsing
│   ├── package.json           # Backend dependencies
│   └── node_modules/          # (created after npm install)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main component (2 views)
│   │   └── index.css          # Tailwind styles
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite build config
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── postcss.config.js      # PostCSS for Tailwind
│   ├── package.json           # Frontend dependencies
│   └── node_modules/          # (created after npm install)
│
├── package.json               # Root package.json (optional)
├── README.md                  # Full documentation
├── QUICKSTART.md              # Quick start guide
├── setup.sh                   # Automated setup script
└── .gitignore                 # Git ignore rules
```

## Step-by-Step Installation

### Prerequisites

1. **Install Node.js & npm**
   - Go to https://nodejs.org/
   - Download the LTS version (16.x or higher)
   - Install it following the installer
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

### Installation & Running

**Option 1: Manual Setup (Recommended for first time)**

1. **Install Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   npm start
   # Output: "News API running on port 5000"
   ```

4. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   # Output will show: "Local: http://localhost:5173"
   ```

5. **Open Browser**
   - Go to `http://localhost:5173`
   - Select news sources
   - Click "Generate Stream"
   - Start scrolling! 🎉

**Option 2: Using setup.sh (After Node.js is installed)**

```bash
bash setup.sh
```

Then start both servers in separate terminals:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

## Application Flow

### Initial Load
```
User opens http://localhost:5173
        ↓
[Source Selection Dashboard]
- Choose BBC News, TechCrunch, The Verge, etc.
- Click "Generate Stream"
        ↓
```

### News Feed
```
[Infinite Scroll Feed]
- Articles displayed in date order (newest first)
- Images lazy-loaded
- Auto-loads more as you scroll
- Click article to read on source website
        ↓
[Backend API]
GET /api/news?sources=bbc,techcrunch&page=1
        ↓
[RSS Parser]
Fetches & parses XML feeds
Extracts: title, link, date, image
        ↓
[Sends to Frontend]
10 articles per page
Indicates if more available
```

## Key Files Explained

### `backend/server.js`
- Express server on port 5000
- RSS feed parsing with `rss-parser` library
- `GET /api/news` endpoint returns paginated articles
- Extracts images from various RSS formats
- Sorts articles by date (newest first)

### `frontend/src/App.jsx`
**View 1: Source Selection**
- User selects news sources to follow
- Beautiful dashboard with toggleable options
- Validates at least one source is selected

**View 2: Infinite Feed**
- Sticky header showing active sources
- Article cards with images, titles, dates
- Intersection Observer triggers loading on scroll
- Loading indicator (animated dots)
- "Caught up" message when no more articles

### `frontend/src/index.css`
- Imports Tailwind CSS utilities
- Custom bounce animations for loading spinner
- Delay variations for staggered animation effect

### `vite.config.js`
- Configures Vite dev server on port 5173
- React plugin for JSX support
- Auto-opens browser on `npm run dev`

### `tailwind.config.js`
- Tailwind CSS configuration
- Content paths for PurgeCSS
- Extensible theme options

## Available News Sources

Currently configured sources (in `backend/server.js`):

1. **BBC News** - World news
   ```
   URL: https://feeds.bbci.co.uk/news/rss.xml
   ID: bbc
   ```

2. **TechCrunch** - Technology and startups
   ```
   URL: https://techcrunch.com/feed/
   ID: techcrunch
   ```

3. **The Verge** - Tech and culture
   ```
   URL: https://www.theverge.com/rss/index.xml
   ID: theverge
   ```

### Adding More Sources

Edit `backend/server.js` and add to `NEWS_SOURCES` object:

```javascript
const NEWS_SOURCES = {
  // ... existing sources ...
  reuters: { 
    name: 'Reuters', 
    url: 'https://www.reutersagency.com/feed/?rpc=76&beta=true' 
  },
  // Add your own RSS feeds here
};
```

Then add the source ID to `AVAILABLE_SOURCES` in `frontend/src/App.jsx`:

```javascript
const AVAILABLE_SOURCES = [
  { id: 'bbc', name: 'BBC News' },
  { id: 'techcrunch', name: 'TechCrunch' },
  { id: 'theverge', name: 'The Verge' },
  { id: 'reuters', name: 'Reuters' },  // Add here
];
```

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:** Run `npm install` in the backend directory first

### Issue: "PORT 5000 already in use"
**Solution:** Kill the process using port 5000 or change PORT in `backend/server.js`

### Issue: CORS error in browser console
**Solution:** Make sure backend is running on port 5000

### Issue: No articles loading
**Solutions:**
1. Check that backend is running (should see "News API running on port 5000")
2. Check browser Network tab - should see successful `/api/news` requests
3. Verify internet connection (RSS feeds require external access)
4. Check if selected sources' RSS feeds are accessible

### Issue: Images not loading
**Cause:** Not all RSS feeds include images consistently
**Solution:** App automatically falls back to Unsplash placeholder

### Issue: npm/node not found after installation
**Solution:** 
1. Restart your terminal
2. On Windows, restart your computer
3. Verify installation: `node --version && npm --version`

## Development Tips

### Hot Module Reloading
- Frontend: Changes to `src/App.jsx` automatically refresh (Vite)
- Backend: Changes require manual server restart

### Debugging
**Frontend:** Open DevTools (F12 or Cmd+Option+I)
- Network tab: Check API requests
- Console: Look for error messages
- React DevTools: Inspect component state

**Backend:** Check terminal output
- Errors from RSS parsing shown in console
- Each source fetch logged

### Performance Monitoring
- Article loading: Check Network tab for `/api/news` requests
- Image loading: Monitor waterfall in Network tab
- Memory: Open DevTools → Memory tab

## Building for Production

```bash
# Build frontend for production
cd frontend
npm run build

# Output goes to frontend/dist/
# Deploy the dist/ folder to any static host
```

## Next Steps & Enhancements

**Recommended additions:**
1. Add more news sources (CNN, Reuters, NPR, HackerNews, etc.)
2. User authentication to save preferences
3. Local storage for saved articles
4. Search functionality
5. Category filters (Tech, Business, Sports, etc.)
6. Share article functionality
7. Read/unread indicators
8. Dark/Light theme toggle
9. Service Worker for offline support
10. Progressive Web App (PWA) capabilities

## Support & Resources

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **Express.js:** https://expressjs.com/
- **RSS Parser:** https://github.com/rbren/rss-parser

## Project Structure Summary

```
NEWSHUB PROJECT STRUCTURE
├── Backend (Express + RSS Parser)
│   ├── Fetches from RSS feeds
│   ├── Parses XML → JSON
│   ├── Sorts by date
│   └── Serves paginated API
│
├── Frontend (React + Vite + Tailwind)
│   ├── Source selection view
│   ├── Infinite scroll feed
│   ├── Lazy image loading
│   └── Intersection Observer
│
└── Features
    ├── Infinite scroll pagination
    ├── Chronological sorting
    ├── Multi-source aggregation
    ├── Modern responsive UI
    ├── Image fallbacks
    └── CORS-enabled API
```

---

**Ready to get started? Follow the Installation steps above!** 🚀

# 🚀 NewsHub - Quick Reference Card

## Installation (One-Time Setup)

```bash
# 1. Navigate to backend
cd backend
npm install

# 2. Navigate to frontend (from root)
cd ../frontend
npm install
```

## Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
# Browser opens automatically
```

## Application Features

| Feature | Details |
|---------|---------|
| **Source Selection** | Choose from BBC, TechCrunch, The Verge |
| **Infinite Scroll** | Auto-loads articles as you scroll |
| **Sorting** | Newest articles first |
| **Images** | Lazy-loaded with fallback placeholders |
| **Responsive** | Works on desktop, tablet, mobile |

## Project Files Overview

### Backend
- `backend/server.js` - Express server with RSS parsing
- `backend/package.json` - Backend dependencies

### Frontend  
- `frontend/src/App.jsx` - Main React component
- `frontend/src/main.jsx` - React entry point
- `frontend/index.html` - HTML template
- `frontend/vite.config.js` - Build configuration
- `frontend/tailwind.config.js` - Styling
- `frontend/package.json` - Frontend dependencies

### Documentation
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `QUICKSTART.md` - Quick start guide
- `SETUP.sh` - Automated installation script

## API Reference

### GET `/api/news`
Fetch news articles from selected sources

**Parameters:**
```
?sources=bbc,techcrunch,theverge&page=1
```

**Response:**
```json
{
  "articles": [
    {
      "title": "Article Title",
      "link": "https://example.com/article",
      "date": "2024-05-30T10:30:00Z",
      "source": "BBC News",
      "image": "https://example.com/image.jpg"
    }
  ],
  "hasMore": true
}
```

## Adding New News Sources

1. Edit `backend/server.js` - Add to `NEWS_SOURCES`:
```javascript
news_source_id: { 
  name: 'Source Name', 
  url: 'https://source-rss-feed-url' 
}
```

2. Edit `frontend/src/App.jsx` - Add to `AVAILABLE_SOURCES`:
```javascript
{ id: 'news_source_id', name: 'Source Name' }
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Troubleshooting Quick Fix

| Problem | Solution |
|---------|----------|
| Backend won't start | Check port 5000 isn't used: `lsof -i :5000` |
| No articles loading | Ensure backend is running & you have internet |
| CORS errors | Backend must be running on port 5000 |
| Images broken | Normal - app uses fallback placeholder |
| npm not found | Install Node.js from nodejs.org |

## Technology Stack

```
Frontend: React 18 + Vite + Tailwind CSS
Backend: Express.js + RSS Parser
APIs: REST (own backend)
Styling: Tailwind CSS + PostCSS
Build: Vite
```

## File Structure at a Glance

```
news-app-new/
├── backend/
│   ├── server.js (Express + RSS)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx (Main UI)
│   │   ├── main.jsx (Entry)
│   │   └── index.css (Styles)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── README.md
├── SETUP_GUIDE.md
└── QUICKSTART.md
```

## Next Steps

1. ✅ Install Node.js (if not done)
2. ✅ Run `npm install` in backend/ and frontend/
3. ✅ Start backend with `npm start`
4. ✅ Start frontend with `npm run dev`
5. ✅ Open http://localhost:5173
6. ✅ Select sources and start browsing!

---

**For detailed help, see:**
- Setup instructions: `SETUP_GUIDE.md`
- Full documentation: `README.md`  
- Quick start: `QUICKSTART.md`

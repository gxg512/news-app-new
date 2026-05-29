# NewsHub - Infinite News Feed

A modern React-based web application that fetches news articles from multiple RSS sources and displays them in an infinite scrolling feed sorted by date.

## Features

- ✨ **News Source Selection** - Choose from BBC News, TechCrunch, The Verge, and more
- 📜 **Infinite Scroll** - Automatically loads more articles as you scroll
- 📅 **Chronological Sorting** - All articles sorted by publication date (newest first)
- 🖼️ **Image Thumbnails** - Each article displays a thumbnail image
- 🎨 **Modern UI** - Built with Tailwind CSS and React for a sleek, responsive design
- 🚀 **Vite + React** - Fast development experience with hot module replacement

## Project Structure

```
news-app-new/
├── backend/
│   ├── server.js          # Express server with RSS parsing
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx       # React entry point
│   │   ├── App.jsx        # Main React component
│   │   └── index.css      # Tailwind CSS imports
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind configuration
│   ├── postcss.config.js  # PostCSS configuration
│   └── package.json
└── README.md
```

## Installation & Setup

### ⚠️ PREREQUISITES - MUST INSTALL FIRST

Before proceeding, you **MUST** have Node.js and npm installed on your system.

#### Check if Node.js is installed:
```bash
node --version
npm --version
```

If you see version numbers, you're good to go. If you get "command not found", follow the installation below.

#### Install Node.js & npm

**Windows & macOS:**
1. Go to https://nodejs.org/
2. Download the **LTS (Long Term Support)** version
3. Run the installer and follow the prompts
4. Restart your terminal/command prompt
5. Verify: `node --version && npm --version`

**Linux (Ubuntu/Debian):**
```bash
# Option 1: Using nvm (Recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Option 2: Using apt
sudo apt-get update
sudo apt-get install -y nodejs npm
```

**Linux (CentOS/RHEL):**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

After installation, verify it worked:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies (this will take 1-2 minutes):
```bash
npm install
```

You should see output like:
```
added 49 packages in 30s
```

3. Start the backend server:
```bash
npm start
```

Expected output:
```
News API running on port 5000
```

Keep this terminal open. The backend is now running.

### Frontend Setup

1. Open a **new terminal** and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (this will take 2-3 minutes):
```bash
npm install
```

You should see output like:
```
added 200+ packages in 2m
```

3. Start the development server:
```bash
npm run dev
```

Expected output:
```
  VITE v4.3.9  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Your browser should automatically open to `http://localhost:5173`. If not, manually visit that URL.

### ✅ You're Done!

## How It Works

### Flow:
1. **Select News Sources**: When you first load the app, select at least one news source
2. **Generate Stream**: Click "Generate Stream" to start fetching articles
3. **Infinite Scroll**: Articles load automatically as you scroll down
4. **View Articles**: Click any article title to read the full story on the source website

### Backend (`server.js`):
- Fetches RSS feeds from multiple news sources
- Parses XML and extracts article metadata (title, link, date, image)
- Combines and sorts articles chronologically
- Provides paginated API endpoints for the frontend
- Handles CORS for frontend requests

### Frontend (`App.jsx`):
- **Source Selection View**: Initial configuration screen
- **Infinite Feed View**: Main article feed with lazy-loaded images
- **Intersection Observer**: Automatically triggers loading when scrolling reaches bottom
- **Error Handling**: Falls back to placeholder images if article images fail to load

## API Endpoints

### GET `/api/news`
Fetch paginated news articles from selected sources.

**Query Parameters:**
- `sources` (required): Comma-separated source IDs (e.g., `bbc,techcrunch,theverge`)
- `page` (optional): Page number for pagination (default: 1)

**Response:**
```json
{
  "articles": [
    {
      "title": "Article Title",
      "link": "https://...",
      "date": "2024-05-30T10:30:00.000Z",
      "source": "BBC News",
      "image": "https://..."
    }
  ],
  "hasMore": true
}
```

## Supported News Sources

- **BBC News** - https://feeds.bbci.co.uk/news/rss.xml
- **TechCrunch** - https://techcrunch.com/feed/
- **The Verge** - https://www.theverge.com/rss/index.xml

To add more sources, edit `backend/server.js` and add entries to the `NEWS_SOURCES` object.

## Technologies Used

### Backend
- **Express.js** - Web server framework
- **rss-parser** - RSS feed parsing library
- **CORS** - Cross-Origin Resource Sharing middleware

### Frontend
- **React 18** - UI library
- **Vite** - Frontend build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Intersection Observer API** - For infinite scroll

## Performance Optimizations

- 🖼️ **Lazy Loading**: Images load only when needed
- ⚡ **Pagination**: Articles loaded in batches of 10
- 🔄 **Parallel Requests**: All RSS feeds fetched simultaneously
- 🎯 **Efficient Sorting**: Single sort after aggregation
- 💾 **Caching**: Browser caches fetched articles

## Troubleshooting

### ❌ "npm: command not found" or "node: command not found"
- **Cause**: Node.js and npm are not installed on your system
- **Solution**: 
  1. Go to https://nodejs.org/ and install the LTS version
  2. Restart your terminal (close and reopen it)
  3. Run `node --version && npm --version` to verify
  4. If still not found on Linux, try: `source ~/.bashrc` then retry

### ❌ Backend won't connect
- Ensure backend server is running on port 5000 (should see "News API running on port 5000")
- Check that no firewall is blocking localhost connections
- Verify CORS is enabled in backend/server.js
- Make sure backend terminal is still open and running

### ❌ "npm install" hangs or times out
- Check your internet connection
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules/` and `package-lock.json`, then try again:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### ❌ Port 5000 already in use (Backend fails to start)
- Another process is using port 5000
- **Linux/macOS:** `lsof -i :5000` to find the process, then `kill -9 <PID>`
- **Windows:** `netstat -ano | findstr :5000` to find process ID, then `taskkill /PID <PID> /F`
- Or change the PORT in `backend/server.js` to a different port like 5001

### ❌ Port 5173 already in use (Frontend fails to start)
- Edit `frontend/vite.config.js` and change the port:
  ```javascript
  server: {
    port: 3000,  // Change to any available port
  }
  ```

### ❌ Images not loading
- RSS feeds may not always include images
- App falls back to Unsplash placeholder
- Check browser console (F12) for specific image loading errors

### ❌ No articles appearing
- Verify selected news sources are working
- Check browser's Network tab (F12 → Network) for `/api/news` requests
- Ensure backend is running and no CORS errors in console
- Check that you selected at least one news source before clicking "Generate Stream"

### ❌ "Cannot find module 'express'" or other package errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Make sure you're in the correct directory (backend/ or frontend/)

### ❌ Vite dev server won't open browser automatically
- Manually open `http://localhost:5173` in your browser
- Or add `--host` flag: `npm run dev -- --host`

## Future Enhancements

- Add more news sources (CNN, Reuters, NPR, etc.)
- User authentication and saved preferences
- Search and filter functionality
- Read time estimates
- Dark/Light theme toggle
- Share articles functionality
- Local caching with Service Workers

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or feature requests, please refer to the troubleshooting section above or check the documentation files:
- **SETUP_GUIDE.md** - Detailed setup instructions
- **QUICK_REFERENCE.md** - Commands and API reference
- **QUICKSTART.md** - Step-by-step guide

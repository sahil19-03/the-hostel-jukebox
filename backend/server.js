// server.js — The Hostel Jukebox Express API
const express  = require("express");
const cors     = require("cors");
const YTSearch = require("youtube-search-without-api-key");
const playlists = require("./data/playlists");
const songs     = require("./data/songs");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());

// ── In-memory cache for YouTube search results ───────────────
const ytCache = new Map();

// ── Health check ─────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "🎵 Hostel Jukebox API is running!" });
});

// ── GET /api/playlists  →  all playlists ─────────────────────
app.get("/api/playlists", (_req, res) => {
  const enriched = playlists.map((pl) => ({
    ...pl,
    songCount: songs.filter((s) => s.playlist === pl.id).length,
  }));
  res.json({ success: true, data: enriched });
});

// ── GET /api/playlists/:id  →  one playlist + its songs ──────
app.get("/api/playlists/:id", (req, res) => {
  const pl = playlists.find((p) => p.id === req.params.id);
  if (!pl) {
    return res.status(404).json({ success: false, message: "Playlist not found" });
  }
  const playlistSongs = songs.filter((s) => s.playlist === pl.id);
  res.json({ success: true, data: { ...pl, songs: playlistSongs } });
});

// ── GET /api/songs  →  all songs (optional ?playlist= filter) ─
app.get("/api/songs", (req, res) => {
  const { playlist, mood } = req.query;
  let result = songs;
  if (playlist) result = result.filter((s) => s.playlist === playlist);
  if (mood) {
    const ids = playlists.filter((p) => p.mood === mood).map((p) => p.id);
    result = result.filter((s) => ids.includes(s.playlist));
  }
  res.json({ success: true, count: result.length, data: result });
});

// ── GET /api/youtube/search?q=  →  YouTube video ID ──────────
// Searches YouTube for a song and returns the best matching video ID
app.get("/api/youtube/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ success: false, message: "Missing query param q" });
  }

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  if (ytCache.has(cacheKey)) {
    console.log(`[YT Cache HIT] ${query}`);
    return res.json({ success: true, ...ytCache.get(cacheKey) });
  }

  try {
    console.log(`[YT Search] ${query}`);
    // Search YouTube — try to find official audio or video
    const searchQuery = `${query} official audio`;
    const results = await YTSearch.search(searchQuery);

    // Filter to videos only (not playlists/channels)
    const videos = results.filter(
      (r) => r.type === "video" || r.id?.videoId || r.url?.includes("watch")
    );

    if (!videos || videos.length === 0) {
      return res.status(404).json({ success: false, message: "No YouTube results found" });
    }

    const best = videos[0];
    // Extract video ID from various response formats
    const videoId =
      best.id?.videoId ||
      best.videoId ||
      (best.url && best.url.includes("v=")
        ? best.url.split("v=")[1]?.split("&")[0]
        : null) ||
      best.id;

    if (!videoId) {
      return res.status(404).json({ success: false, message: "Could not extract video ID" });
    }

    const result = {
      videoId,
      title: best.title || query,
      thumbnail: best.thumbnails?.[0]?.url || best.thumbnail || null,
    };

    // Cache the result
    ytCache.set(cacheKey, result);
    console.log(`[YT Found] ${query} → ${videoId}`);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error(`[YT Error] ${query}:`, err.message);
    res.status(500).json({ success: false, message: "YouTube search failed", error: err.message });
  }
});

// ── Start (local dev only) ───────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🎵 Hostel Jukebox API running at http://localhost:${PORT}\n`);
  });
}

// ── Export for Vercel serverless ─────────────────────────────
module.exports = app;

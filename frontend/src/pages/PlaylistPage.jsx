// pages/PlaylistPage.jsx — Full-screen playlist experience
// Background = playlist cover · Songs overlay · Floating pill player
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";

const API = "/api";

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function PlaylistPage() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs]       = useState([]);
  const [loading, setLoading]   = useState(true);

  const {
    currentSong, isPlaying, elapsed, duration,
    loading: ytLoading, liked,
    playSong, togglePlayPause, nextSong, prevSong, toggleLike, seek,
    isShuffle, toggleShuffle
  } = usePlayer();

  useEffect(() => {
    // Auto-play the playlist when visiting this page, if it's not already playing
    if (songs.length > 0) {
      const isCurrentlyPlayingThisPlaylist = currentSong && currentSong.playlist === id;
      if (!isCurrentlyPlayingThisPlaylist) {
        playSong(songs[0], songs, 0);
      }
    }
  }, [songs, id]); // Only run when songs are loaded or id changes

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    axios.get(`${API}/playlists/${id}`)
      .then((r) => {
        setPlaylist(r.data.data);
        setSongs(r.data.data.songs || []);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [id]);

  if (loading || !playlist) {
    return (
      <div className="pl-loading-screen">
        <div className="spinner" />
        <span>Loading playlist…</span>
      </div>
    );
  }

  const accent   = playlist.accentColor || "#f5c842";
  const totalDur = duration || currentSong?.duration || 0;
  const pct      = totalDur > 0 ? Math.min((elapsed / totalDur) * 100, 100) : 0;
  const isLiked  = currentSong && liked.has(currentSong.id);

  return (
    <div className="pl-root">

      {/* ── Background Art ── */}
      <div className="pl-bg">
        {playlist.cover
          ? <img src={playlist.cover} alt={playlist.name} className="pl-bg-img" />
          : <div className="pl-bg-gradient" style={{ background: playlist.heroGradient }} />
        }
      </div>

      {/* ── Brand Logo (Non-clickable) ── */}
      <div className="pl-brand">
        <div className="home-brand-logo" style={{ color: accent, boxShadow: `0 4px 20px ${accent}20` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div className="home-brand-text">
          <span className="home-brand-name">The Hostel</span>
          <span className="home-brand-accent" style={{ color: accent }}>Jukebox</span>
        </div>
      </div>

      {/* ── Home Button ── */}
      <button className="pl-home-btn" onClick={() => navigate("/")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Home
      </button>

      {/* ── Playlist Info Overlay ── */}
      <div className="pl-info-overlay">
        <h1 className="pl-info-hindi" style={{ WebkitTextStrokeColor: accent }}>{playlist.hindiName}</h1>
        <h2 className="pl-info-name">{playlist.name}</h2>
        <p className="pl-info-tagline">{playlist.tagline}</p>
      </div>


      {/* ── Floating pill player ── */}
      {currentSong && (
        <div className="fp-player" style={{ borderColor: `${accent}30` }}>
          {/* Cover */}
          <div className={`fp-cover ${isPlaying ? 'fp-spinning' : ''}`}>
            {playlist.cover
              ? <img src={playlist.cover} alt="" />
              : <div className="fp-cover-fb" style={{ background: `${accent}22` }}>🎵</div>
            }
          </div>

          {/* Info */}
          <div className="fp-info">
            <div className="fp-title">{currentSong.title}</div>
            <div className="fp-artist">{currentSong.artist}</div>
          </div>

          {/* Progress */}
          <div className="fp-progress">
            <span className="fp-time">{formatTime(elapsed)}</span>
            <input 
              type="range"
              className="fp-seek-bar"
              min="0" max="100"
              value={pct || 0}
              onChange={(e) => seek(e.target.value / 100)}
              style={{ '--pct': `${pct}%`, '--accent': accent }}
            />
            <span className="fp-time">{formatTime(totalDur)}</span>
          </div>

          {/* Controls */}
          <div className="fp-controls">
            <button className={`fp-btn ${isShuffle ? 'fp-active-accent' : ''}`} style={{ color: isShuffle ? accent : '' }} onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
            </button>
            <button className="fp-btn" onClick={(e) => { e.stopPropagation(); prevSong(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="19 20 9 12 19 4 19 20" />
                <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button className="fp-play" style={{ background: accent }} onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}>
              {ytLoading ? (
                <div className="fp-spinner" />
              ) : isPlaying ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>
            <button className="fp-btn" onClick={(e) => { e.stopPropagation(); nextSong(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 4 15 12 5 20 5 4" />
                <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <button className={`fp-btn ${isLiked ? "fp-liked" : ""}`} onClick={(e) => { e.stopPropagation(); toggleLike(); }}>
              {isLiked ? "♥" : "♡"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

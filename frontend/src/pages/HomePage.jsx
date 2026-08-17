// pages/HomePage.jsx — Minimal immersive home
// Full-screen hostel room photo · Dark left with only playlist names
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";

const API = import.meta.env.VITE_API_URL || "/api";

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function HomePage() {
  const [playlists, setPlaylists] = useState([]);
  const [hovered, setHovered]     = useState(null);
  const [liveCount, setLiveCount] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);
  const navigate = useNavigate();

  const handleShare = async () => {
    const url  = window.location.origin;
    const text = `The Hostel Jukebox — where every song brings back a memory you didn't know you were missing. 🎵\nSongs for every mood. 🎧`;
    if (navigator.share) {
      try { await navigator.share({ title: "The Hostel Jukebox", text, url }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${url}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const {
    currentSong, isPlaying, elapsed, duration,
    loading: ytLoading, liked, queue, queueIndex, playSong,
    togglePlayPause, nextSong, prevSong, toggleLike, seek,
    isShuffle, toggleShuffle
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const queueRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (queueRef.current && !queueRef.current.contains(e.target)) {
        setShowQueue(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Simulated live user count ──────────────────────────────
  useEffect(() => {
    // Base count on hour of day (late night/morning = fewer, evening = more)
    const getBase = () => {
      const h = new Date().getHours();
      if (h >= 22 || h < 2)  return Math.floor(Math.random() * 8)  + 8;  // 8-15 (late night hostel peak)
      if (h >= 2  && h < 7)  return Math.floor(Math.random() * 4)  + 2;  // 2-5  (dead hours)
      if (h >= 18 && h < 22) return Math.floor(Math.random() * 10) + 6;  // 6-15 (evening)
      return Math.floor(Math.random() * 6) + 3;                           // 3-8  (rest of day)
    };
    setLiveCount(getBase());
    // Fluctuate every 8-12 seconds for a real-time feel
    const iv = setInterval(() => {
      setLiveCount(prev => {
        const delta = Math.random() < 0.5 ? 1 : -1;
        const next = prev + delta;
        return Math.max(2, Math.min(20, next));
      });
    }, 8000 + Math.random() * 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    axios.get(`${API}/playlists`).then((r) => setPlaylists(r.data.data));
  }, []);

  const activePl = hovered ? playlists.find((p) => p.id === hovered) : null;

  // The playlist that is currently playing music
  const playingPl = currentSong 
    ? playlists.find(p => p.id === currentSong.playlist) 
    : null;

  // Which playlist vibe to show? Hover takes priority, fallback to playing playlist
  const displayPl = activePl || playingPl;

  // Define accent colors for the player based on what's playing
  const playerAccent = playingPl?.accentColor || "#f5c842";
  const totalDur = duration || currentSong?.duration || 0;
  const pct = totalDur > 0 ? Math.min((elapsed / totalDur) * 100, 100) : 0;
  const isLiked = currentSong && liked.has(currentSong.id);

  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    if (diff < -40) {
      setIsExpanded(true); // Dragged up
      touchStartY.current = null;
    } else if (diff > 40) {
      setIsExpanded(false); // Dragged down
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  return (
    <div className="home-root">

      {/* ── Live users pill ── */}
      {liveCount !== null && (
        <div className="home-live-pill">
          <span className="home-live-dot" />
          <span className="home-live-text">{liveCount} vibing right now</span>
        </div>
      )}

      {/* ── Mobile Logo (Fixed Top Left) ── */}
      <div className="home-brand mobile-brand">
        <div className="home-brand-logo" style={{ color: playerAccent, boxShadow: `0 4px 20px ${playerAccent}20` }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <div className="home-brand-text">
          <span className="home-brand-name">The Hostel</span>
          <span className="home-brand-accent" style={{ color: playerAccent }}>Jukebox</span>
        </div>
      </div>

      {/* ── Social Links ── */}
      <div className="home-socials">
        {/* GitHub */}
        <a href="https://github.com/sahil19-03" target="_blank" rel="noopener noreferrer" className="home-social-link" title="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        {/* LinkedIn */}
        <a href="https://www.linkedin.com/in/sahil-raj-767b65290" target="_blank" rel="noopener noreferrer" className="home-social-link" title="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
        {/* X (Twitter) */}
        <a href="https://x.com/SahilRajAgr" target="_blank" rel="noopener noreferrer" className="home-social-link" title="X (Twitter)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.626L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
          </svg>
        </a>
        {/* Instagram */}
        <a href="https://www.instagram.com/_sahil_savish" target="_blank" rel="noopener noreferrer" className="home-social-link home-social-insta" title="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </a>

        {/* Divider */}
        <div className="home-socials-divider" />

        {/* Share button */}
        <button onClick={handleShare} className="home-social-link home-social-share" title="Share this Jukebox">
          {shareCopied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Copied toast ── */}
      {shareCopied && (
        <div className="home-share-toast">
          🎵 Link copied! Share the vibe with your hostel crew!
        </div>
      )}

      {/* ── Full-screen background photo ── */}
      <div className="home-bg">
        <img src="/images/hero.png" alt="Hostel room" className="home-bg-img" />
        {/* Colour tint shifts on hover or playback */}
        <div
          className="home-bg-tint"
          style={{
            background: displayPl
              ? `linear-gradient(to right, ${displayPl.bgOverlay} 0%, rgba(0,0,0,0) 60%)`
              : "linear-gradient(to right, rgba(4,6,18,0.92) 0%, rgba(4,6,18,0.30) 55%, rgba(0,0,0,0) 100%)",
          }}
        />
      </div>

      {/* ── Left panel — playlist names only ── */}
      <aside 
        className={`home-left ${isExpanded ? 'expanded' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mobile-drag-handle"></div>

        {/* App branding */}
        <div className="home-brand">
          <div className="home-brand-logo" style={{ color: playerAccent, boxShadow: `0 4px 20px ${playerAccent}20` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
          <div className="home-brand-text">
            <span className="home-brand-name">The Hostel</span>
            <span
              className="home-brand-accent"
              style={{ color: playerAccent }}
            >
              Jukebox
            </span>
          </div>
        </div>

        <div className="home-divider" />

        {/* Playlist names — text only */}
        <nav className="home-pl-nav">
          <p className="home-pl-nav-label">Playlists</p>
          {playlists.map((pl, i) => {
            const isPlayingThis = playingPl?.id === pl.id && isPlaying;
            
            return (
              <button
                key={pl.id}
                className={`home-pl-name-btn ${hovered === pl.id ? "home-pl-name-btn--hover" : ""}`}
                style={{
                  animationDelay: `${i * 0.07}s`,
                  "--accent": pl.accentColor,
                }}
                onMouseEnter={() => setHovered(pl.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/playlist/${pl.id}`)}
              >
                <span className="home-pl-btn-dot" style={{ background: pl.accentColor }} />
                
                {/* Modern EQ indicator if this playlist is playing */}
                {isPlayingThis && (
                  <div className="home-pl-eq" style={{ marginLeft: '-4px', marginRight: '8px' }}>
                    <span style={{ background: pl.accentColor }}></span>
                    <span style={{ background: pl.accentColor, animationDelay: "0.1s" }}></span>
                    <span style={{ background: pl.accentColor, animationDelay: "0.2s" }}></span>
                  </div>
                )}
                
                <span className="home-pl-btn-hindi" style={playingPl?.id === pl.id ? { color: pl.accentColor } : {}}>
                  {pl.hindiName}
                </span>
                <span className="home-pl-btn-eng">{pl.name}</span>
                <svg className="home-pl-btn-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            )
          })}
        </nav>

        {/* Tagline at bottom */}
        <div className="home-tagline-bottom">
          <p style={{marginBottom: "16px"}}>
            Every hostel has a vibe.<br />
            <em>We give it a soundtrack.</em>
          </p>
          
          {/* Aesthetic "Now Playing" mini card for the side panel */}
          {currentSong && playingPl && (
            <div className="home-now-playing-mini" onClick={() => navigate(`/playlist/${playingPl.id}`)} style={{ borderColor: `${playerAccent}44` }}>
              <div className="hnpm-cover">
                {playingPl.cover ? (
                  <img src={playingPl.cover} alt="" />
                ) : (
                  <div className="hnpm-fb" style={{ background: `${playerAccent}22` }}>🎵</div>
                )}
              </div>
              <div className="hnpm-info">
                <div className="hnpm-label" style={{ color: playerAccent }}>NOW PLAYING</div>
                <div className="hnpm-title">{currentSong.title}</div>
                <div className="hnpm-artist">{currentSong.artist}</div>
              </div>
            </div>
          )}
        </div>
      </aside>



      {/* ── Floating pill player ── */}
      {currentSong && (
        <div className="fp-player" style={{ borderColor: `${playerAccent}30` }}>
          {/* Cover */}
          <div className={`fp-cover ${isPlaying ? 'fp-spinning' : ''}`} onClick={() => navigate(`/playlist/${playingPl?.id}`)} style={{ cursor: 'pointer' }}>
            {playingPl?.cover
              ? <img src={playingPl.cover} alt="" />
              : <div className="fp-cover-fb" style={{ background: `${playerAccent}22` }}>🎵</div>
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
              style={{ '--pct': `${pct}%`, '--accent': playerAccent }}
            />
            <span className="fp-time">{formatTime(totalDur)}</span>
          </div>

          {/* Controls */}
          <div className="fp-controls">
            <button className={`fp-btn ${isShuffle ? 'fp-active-accent' : ''}`} style={{ color: isShuffle ? playerAccent : '' }} onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}>
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
            <button className="fp-play" style={{ background: playerAccent }} onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}>
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
            
            {/* Queue Toggle Button */}
            <div style={{ position: "relative" }} ref={queueRef}>
              <button 
                className={`fp-btn ${showQueue ? 'fp-active-accent' : ''}`} 
                style={{ color: showQueue ? playerAccent : '' }} 
                onClick={(e) => { e.stopPropagation(); setShowQueue(!showQueue); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2.5" />
                  <circle cx="12" cy="12" r="2.5" />
                  <circle cx="12" cy="19" r="2.5" />
                </svg>
              </button>

              {/* Queue Dropup */}
              {showQueue && queue && queue.length > 0 && (
                <div className="fp-queue-dropup">
                  <div className="fp-queue-header">Up Next</div>
                  <div className="fp-queue-list">
                    {queue.map((song, i) => (
                      <div 
                        key={song.id} 
                        className={`fp-queue-item ${i === queueIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); playSong(song, queue, i); setShowQueue(false); }}
                        style={i === queueIndex ? { '--accent': playerAccent } : {}}
                      >
                        <span className="fp-q-title">{song.title}</span>
                        <span className="fp-q-artist">{song.artist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className={`fp-btn ${isLiked ? "fp-liked" : ""}`} onClick={(e) => { e.stopPropagation(); toggleLike(); }}>
              {isLiked ? "♥" : "♡"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

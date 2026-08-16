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
  const navigate = useNavigate();

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

  return (
    <div className="home-root">

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
      <aside className="home-left">

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

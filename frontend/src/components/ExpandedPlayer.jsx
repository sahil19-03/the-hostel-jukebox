import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export default function ExpandedPlayer() {
  const {
    currentSong, isPlaying, elapsed, duration,
    loading: ytLoading, liked, isExpanded, setIsExpanded,
    queue, queueIndex, isShuffle, toggleShuffle,
    playSong, togglePlayPause, nextSong, prevSong, toggleLike, seek,
    volume, setVolume
  } = usePlayer();
  const navigate = useNavigate();
  const [showQueue, setShowQueue] = useState(false);

  if (!isExpanded || !currentSong) return null;

  const totalDur = duration || currentSong?.duration || 0;
  const pct = totalDur > 0 ? Math.min((elapsed / totalDur) * 100, 100) : 0;
  const isLiked = currentSong && liked.has(currentSong.id);
  
  // We'll extract a nice accent colour based on some hash or default to a warm colour.
  // The backend could pass an accent colour per song, but let's use a nice default if not.
  const accent = "#f5c842";

  return (
    <div className="xp-overlay">
      <div className="xp-backdrop" onClick={() => setIsExpanded(false)}></div>
      
      <div className="xp-container">
        {/* Header */}
        <div className="xp-header">
          <button className="xp-icon-btn" onClick={() => setIsExpanded(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <div className="xp-now-playing-text">NOW PLAYING</div>
          <button className="xp-icon-btn xp-playlist-btn" onClick={() => setShowQueue(!showQueue)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="xp-content">
          {showQueue ? (
            <div className="xp-queue-view">
              <h3 className="xp-queue-title">Up Next</h3>
              <div className="xp-queue-list">
                {queue.map((song, i) => (
                  <div 
                    key={i} 
                    className={`xp-queue-item ${i === queueIndex ? 'xp-queue-active' : ''}`}
                    onClick={() => playSong(song, queue, i)}
                  >
                    <div className="xp-queue-num">{i === queueIndex ? '▶' : i + 1}</div>
                    <div className="xp-queue-info">
                      <div className="xp-queue-song-title" style={{ color: i === queueIndex ? accent : '' }}>{song.title}</div>
                      <div className="xp-queue-artist">{song.artist}</div>
                    </div>
                    <div className="xp-queue-dur">{formatTime(song.duration)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="xp-player-view">
              {/* Record Art */}
              <div className="xp-art-container">
                <div className={`xp-record ${isPlaying ? 'xp-spinning' : ''}`}>
                  <div className="xp-record-center">
                    <img src={currentSong.cover || "/images/hero.png"} alt="Cover" />
                  </div>
                </div>
              </div>

              {/* Title & Artist */}
              <div className="xp-song-details">
                <h2 className="xp-title">{currentSong.title}</h2>
                <h3 className="xp-artist">{currentSong.artist}</h3>
              </div>

              {/* Progress Bar */}
              <div className="xp-progress">
                <span className="xp-time">{formatTime(elapsed)}</span>
                <div className="fp-bar-wrap" style={{ flex: 1 }} onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek((e.clientX - rect.left) / rect.width);
                }}>
                  <div className="fp-bar-bg" style={{ height: '6px' }}>
                    <div className="fp-bar-fill" style={{ width: `${pct}%`, background: accent }} />
                    <div className="fp-bar-thumb" style={{ left: `${pct}%`, background: accent, width: '16px', height: '16px' }} />
                  </div>
                </div>
                <span className="xp-time">{formatTime(totalDur)}</span>
              </div>

              {/* Controls (Shuffle, Prev, Play, Next, Like) */}
              <div className="xp-controls">
                <button className={`xp-control-btn ${isShuffle ? 'xp-active-accent' : ''}`} onClick={toggleShuffle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 3 21 3 21 8"></polyline>
                    <line x1="4" y1="20" x2="21" y2="3"></line>
                    <polyline points="21 16 21 21 16 21"></polyline>
                    <line x1="15" y1="15" x2="21" y2="21"></line>
                    <line x1="4" y1="4" x2="9" y2="9"></line>
                  </svg>
                </button>
                
                <button className="xp-control-btn" onClick={prevSong}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="19 20 9 12 19 4 19 20" />
                    <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>

                <button className="xp-play-btn" style={{ background: accent }} onClick={togglePlayPause}>
                  {ytLoading ? (
                    <div className="fp-spinner" style={{ width: '24px', height: '24px', borderWidth: '3px' }} />
                  ) : isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '4px' }}>
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>

                <button className="xp-control-btn" onClick={nextSong}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 4 15 12 5 20 5 4" />
                    <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>

                <button className={`xp-control-btn ${isLiked ? "xp-active-accent" : ""}`} onClick={toggleLike}>
                  {isLiked ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  )}
                </button>
              </div>

              {/* Volume Slider (bottom left) & Share (bottom right) */}
              <div className="xp-footer">
                <div className="xp-volume">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="xp-volume-slider" 
                  />
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

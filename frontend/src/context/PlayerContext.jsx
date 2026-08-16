// PlayerContext.jsx — Global music player state, drives YouTube IFrame player
import {
  createContext, useContext, useState,
  useRef, useCallback, useEffect,
} from "react";

const API = import.meta.env.VITE_API_URL || "/api";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // ── UI State ─────────────────────────────────────────────
  const [currentSong,  setCurrentSong]  = useState(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isExpanded,   setIsExpanded]   = useState(false);
  const [isShuffle,    setIsShuffle]    = useState(false);
  const [isRepeat,     setIsRepeat]     = useState(false);
  const [elapsed,      setElapsed]      = useState(0);
  const [duration,     setDuration]     = useState(0);
  const [liked,        setLiked]        = useState(new Set());
  const [queue,        setQueue]        = useState([]);
  const [queueIndex,   setQueueIndex]   = useState(-1);
  const [volume,       setVolume]       = useState(80);
  const [loading,      setLoading]      = useState(false); // true while fetching YT ID
  const [toast,        setToast]        = useState({ msg: "", visible: false });

  // ── Refs (avoid stale closures) ─────────────────────────
  const ytRef       = useRef(null);   // YouTubePlayer component ref
  const ytReady     = useRef(false);  // is YouTube player initialized?
  const pollRef     = useRef(null);   // setInterval for progress polling
  const queueRef    = useRef([]);
  const queueIdxRef = useRef(-1);
  const shuffleRef  = useRef(false);
  const repeatRef   = useRef(false);
  const songRef     = useRef(null);
  const toastTimer  = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { shuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatRef.current  = isRepeat;  }, [isRepeat]);
  useEffect(() => { queueRef.current   = queue;     }, [queue]);
  useEffect(() => { queueIdxRef.current = queueIndex; }, [queueIndex]);

  // ── Toast ────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      2600
    );
  }, []);

  // ── Poll YouTube player for elapsed time ─────────────────
  const startPolling = useCallback(() => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      if (!ytRef.current?.isReady()) return;
      const t = ytRef.current.getCurrentTime();
      const d = ytRef.current.getDuration();
      setElapsed(Math.floor(t));
      if (d && d > 0) setDuration(Math.floor(d));
    }, 500);
  }, []);

  const stopPolling = useCallback(() => {
    clearInterval(pollRef.current);
  }, []);

  // ── YouTube player event handler ─────────────────────────
  const handleYTStateChange = useCallback((stateCode) => {
    const YT_PLAYING  = 1;
    const YT_PAUSED   = 2;
    const YT_ENDED    = 0;
    const YT_BUFFERING = 3;

    if (stateCode === YT_PLAYING) {
      setIsPlaying(true);
      setLoading(false);
      startPolling();
    } else if (stateCode === YT_PAUSED) {
      setIsPlaying(false);
      stopPolling();
    } else if (stateCode === YT_BUFFERING) {
      setLoading(true);
    } else if (stateCode === YT_ENDED) {
      stopPolling();
      setElapsed(0);
      // Auto advance
      const q = queueRef.current;
      if (!q.length) return;
      let next;
      if (repeatRef.current) {
        next = queueIdxRef.current;
      } else if (shuffleRef.current) {
        next = Math.floor(Math.random() * q.length);
      } else {
        next = (queueIdxRef.current + 1) % q.length;
      }
      const nextSong = q[next];
      queueIdxRef.current = next;
      setQueueIndex(next);
      setCurrentSong(nextSong);
      songRef.current = nextSong;
      showToast(`▶ ${nextSong.title} – ${nextSong.artist}`);
      fetchAndPlay(nextSong);
    }
  }, [startPolling, stopPolling, showToast]);

  const handleYTReady = useCallback(() => {
    ytReady.current = true;
    ytRef.current?.setVolume(volume);
  }, [volume]);

  // ── Fetch YouTube video ID & load it ─────────────────────
  const fetchAndPlay = useCallback(async (song) => {
    if (!song) return;
    setLoading(true);
    try {
      const q = encodeURIComponent(`${song.title} ${song.artist}`);
      const res = await fetch(`${API}/youtube/search?q=${q}`);
      const data = await res.json();
      if (data.success && data.videoId) {
        ytRef.current?.loadVideo(data.videoId);
        // Player will fire onStateChange PLAYING → startPolling
      } else {
        showToast("⚠️ Could not find this song on YouTube");
        setLoading(false);
        setIsPlaying(false);
      }
    } catch (err) {
      showToast("⚠️ YouTube search failed");
      setLoading(false);
      setIsPlaying(false);
    }
  }, [showToast]);

  // ── playSong ──────────────────────────────────────────────
  const playSong = useCallback((song, songQueue = [], idx = 0) => {
    stopPolling();
    setCurrentSong(song);
    songRef.current = song;
    setElapsed(0);
    setDuration(song.duration || 0);
    setLoading(true);

    if (songQueue.length) {
      setQueue(songQueue);
      queueRef.current = songQueue;
      setQueueIndex(idx);
      queueIdxRef.current = idx;
    }

    showToast(`▶ ${song.title} – ${song.artist}`);
    fetchAndPlay(song);
  }, [stopPolling, fetchAndPlay, showToast]);

  // ── Controls ──────────────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    if (!songRef.current) return;
    if (isPlaying) {
      ytRef.current?.pause();
    } else {
      ytRef.current?.play();
    }
  }, [isPlaying]);

  const nextSong = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const next = shuffleRef.current
      ? Math.floor(Math.random() * q.length)
      : (queueIdxRef.current + 1) % q.length;
    playSong(q[next], q, next);
  }, [playSong]);

  const prevSong = useCallback(() => {
    const cur = ytRef.current?.getCurrentTime() ?? 0;
    if (cur > 4) {
      ytRef.current?.seekTo(0);
      return;
    }
    const q = queueRef.current;
    if (!q.length) return;
    let prev = queueIdxRef.current - 1;
    if (prev < 0) prev = q.length - 1;
    playSong(q[prev], q, prev);
  }, [playSong]);

  const seek = useCallback((pct) => {
    const d = ytRef.current?.getDuration() || duration;
    if (!d) return;
    const t = pct * d;
    ytRef.current?.seekTo(t);
    setElapsed(Math.floor(t));
  }, [duration]);

  const toggleLike = useCallback(() => {
    if (!songRef.current) return;
    const id = songRef.current.id;
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Removed from liked songs"); }
      else { next.add(id); showToast("❤️ Added to liked songs"); }
      return next;
    });
  }, [showToast]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((s) => { showToast(!s ? "🔀 Shuffle On" : "Shuffle Off"); return !s; });
  }, [showToast]);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((r) => { showToast(!r ? "🔁 Repeat On" : "Repeat Off"); return !r; });
  }, [showToast]);

  const handleSetVolume = useCallback((v) => {
    setVolume(v);
    ytRef.current?.setVolume(v);
  }, []);

  // ── Cleanup ───────────────────────────────────────────────
  useEffect(() => () => { clearInterval(pollRef.current); clearTimeout(toastTimer.current); }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, isShuffle, isRepeat,
      isExpanded, setIsExpanded,
      elapsed, duration, liked, queue, queueIndex, volume,
      loading, toast,
      ytRef,
      handleYTStateChange, handleYTReady,
      playSong, togglePlayPause, nextSong, prevSong,
      seek, toggleLike, toggleShuffle, toggleRepeat,
      setVolume: handleSetVolume, showToast,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}

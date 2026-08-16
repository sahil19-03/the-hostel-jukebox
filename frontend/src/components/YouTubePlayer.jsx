// components/YouTubePlayer.jsx
// Hidden YouTube IFrame player — controls actual audio playback
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const YT_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
};

// Load YouTube IFrame API script once
let ytScriptLoaded = false;
let ytScriptCallbacks = [];

function loadYTScript() {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    ytScriptCallbacks.push(resolve);
    if (!ytScriptLoaded) {
      ytScriptLoaded = true;
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        ytScriptCallbacks.forEach((cb) => cb());
        ytScriptCallbacks = [];
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

const YouTubePlayer = forwardRef(function YouTubePlayer(
  { onStateChange, onReady },
  ref
) {
  const playerRef = useRef(null);
  const divRef = useRef(null);

  useEffect(() => {
    let player;
    loadYTScript().then(() => {
      player = new window.YT.Player(divRef.current, {
        height: "1",
        width: "1",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (e) => {
            playerRef.current = e.target;
            onReady?.(e.target);
          },
          onStateChange: (e) => {
            onStateChange?.(e.data, e.target);
          },
        },
      });
    });

    return () => {
      try { player?.destroy(); } catch (_) {}
    };
  }, []);

  useImperativeHandle(ref, () => ({
    loadVideo: (videoId) => {
      if (playerRef.current && videoId) {
        playerRef.current.loadVideoById(videoId);
      }
    },
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    seekTo: (seconds) => playerRef.current?.seekTo(seconds, true),
    setVolume: (v) => playerRef.current?.setVolume(v),
    getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
    getDuration: () => playerRef.current?.getDuration?.() ?? 0,
    getState: () => playerRef.current?.getPlayerState?.() ?? -1,
    isReady: () => !!playerRef.current,
  }));

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
        overflow: "hidden",
      }}
    >
      <div ref={divRef} />
    </div>
  );
});

export { YT_STATES };
export default YouTubePlayer;

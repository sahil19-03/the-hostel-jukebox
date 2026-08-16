import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import YouTubePlayer from "./components/YouTubePlayer";
import HomePage from "./pages/HomePage";
import PlaylistPage from "./pages/PlaylistPage";

function AppLayout() {
  const { ytRef, handleYTStateChange, handleYTReady } = usePlayer();

  return (
    <>
      {/* Hidden YouTube IFrame player — mounts once, persists across routes */}
      <YouTubePlayer
        ref={ytRef}
        onStateChange={handleYTStateChange}
        onReady={handleYTReady}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/playlist/:id" element={<PlaylistPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </PlayerProvider>
  );
}

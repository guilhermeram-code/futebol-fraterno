import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setMusicUrl: (url: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// Singleton audio element to persist across navigation
let globalAudio: HTMLAudioElement | null = null;
let globalMusicUrl = "/musica-fundo.mp3";

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const initialized = useRef(false);

  // Initialize audio element once
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      if (!globalAudio) {
        globalAudio = new Audio(globalMusicUrl);
        globalAudio.loop = true;
        globalAudio.volume = 0.3;
        globalAudio.preload = "auto";
      }

      // Sync state with actual audio state
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      globalAudio.addEventListener("play", handlePlay);
      globalAudio.addEventListener("pause", handlePause);

      // Check if already playing (from previous navigation)
      if (!globalAudio.paused) {
        setIsPlaying(true);
      }

      return () => {
        if (globalAudio) {
          globalAudio.removeEventListener("play", handlePlay);
          globalAudio.removeEventListener("pause", handlePause);
        }
      };
    }
  }, []);

  // Update muted state
  useEffect(() => {
    if (globalAudio) {
      globalAudio.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = useCallback(() => {
    if (globalAudio) {
      if (globalAudio.paused) {
        globalAudio.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Error playing audio:", error);
          });
      } else {
        globalAudio.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setMusicUrl = useCallback((url: string) => {
    if (globalAudio && globalMusicUrl !== url) {
      const wasPlaying = !globalAudio.paused;
      globalMusicUrl = url;
      globalAudio.src = url;
      globalAudio.load();
      if (wasPlaying) {
        globalAudio.play().catch(console.error);
      }
    }
  }, []);

  return (
    <MusicContext.Provider value={{ isPlaying, isMuted, togglePlay, toggleMute, setMusicUrl }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return context;
}

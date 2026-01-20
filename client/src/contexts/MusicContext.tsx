import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  setMusicUrl: (url: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [musicUrl, setMusicUrl] = useState("/CampeonatoFraterno2026.mp3");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = 0.3; // Volume baixo-normal
    audioRef.current = audio;

    // Auto-play when component mounts
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Autoplay prevented by browser:", error);
        // User will need to click to start music
      }
    };

    playAudio();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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

import { Volume2, VolumeX, Play, Pause, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/contexts/MusicContext";

export function AudioPlayer() {
  const { isPlaying, isMuted, toggleMute, togglePlay } = useMusic();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black/90 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D4AF37]/50 shadow-lg">
      <Music className="h-4 w-4 text-[#D4AF37]/70" />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10 h-8 w-8"
        title={isPlaying ? "Pausar música" : "Tocar música"}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10 h-8 w-8"
        title={isMuted ? "Ativar som" : "Silenciar"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      <span className="text-[#D4AF37] text-xs font-medium min-w-[60px]">
        {isPlaying ? (isMuted ? "Mudo" : "Tocando") : "Pausado"}
      </span>
    </div>
  );
}

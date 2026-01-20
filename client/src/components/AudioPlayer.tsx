import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/contexts/MusicContext";

export function AudioPlayer() {
  const { isPlaying, isMuted, toggleMute, togglePlay } = useMusic();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D4AF37]/30">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10"
        title={isMuted ? "Ativar som" : "Silenciar"}
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      <span className="text-[#D4AF37] text-sm">
        {isPlaying ? "Tocando" : "Pausado"}
      </span>
      {!isPlaying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="text-[#D4AF37] hover:text-[#D4AF37]/80 hover:bg-[#D4AF37]/10"
        >
          Tocar
        </Button>
      )}
    </div>
  );
}

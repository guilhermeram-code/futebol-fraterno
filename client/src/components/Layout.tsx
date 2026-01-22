import { ReactNode } from "react";
import { useTournament } from "@/contexts/TournamentContext";
import { AudioPlayer } from "./AudioPlayer";

interface LayoutProps {
  children: ReactNode;
  showAudioPlayer?: boolean;
}

export function Layout({ children, showAudioPlayer = true }: LayoutProps) {
  const { settings } = useTournament();

  const backgroundStyle = settings.tournamentBackground 
    ? {
        backgroundImage: `url(${settings.tournamentBackground}?v=${Date.now()})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }
    : {};

  return (
    <div 
      className={`min-h-screen ${!settings.tournamentBackground ? 'bg-background masonic-pattern' : ''}`}
      style={backgroundStyle}
    >
      {settings.tournamentBackground && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-[2px] -z-10" />
      )}
      {children}
      {showAudioPlayer && <AudioPlayer />}
    </div>
  );
}

import { ReactNode } from "react";
import { useTournament } from "@/contexts/TournamentContext";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
    </div>
  );
}

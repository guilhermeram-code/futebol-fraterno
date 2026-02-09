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
      className={`min-h-screen flex flex-col ${!settings.tournamentBackground ? 'bg-background masonic-pattern' : ''}`}
      style={backgroundStyle}
    >
      {settings.tournamentBackground && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-[2px] -z-10" />
      )}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Rodapé discreto com branding PeladaPro */}
      <footer className="bg-secondary/50 backdrop-blur-sm border-t border-white/10 py-4 mt-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} {settings.tournamentName}. Todos os direitos reservados.
            </p>
            <a 
              href="/landing" 
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
              title="Conheça o PeladaPro - Organize seu campeonato"
            >
              <span className="text-xs">Criado com</span>
              <span className="font-bold text-gold group-hover:text-gold text-sm">PeladaPro</span>
              <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">→</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

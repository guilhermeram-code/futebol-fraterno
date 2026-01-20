import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface TournamentSettings {
  tournamentName: string;
  tournamentSubtitle: string;
  tournamentOrganizer: string;
  tournamentLogo: string;
  tournamentMusic: string;
  tournamentBackground: string;
}

interface TournamentContextType {
  settings: TournamentSettings;
  isLoading: boolean;
  refetch: () => void;
}

const defaultSettings: TournamentSettings = {
  tournamentName: "Campeonato Fraterno 2026",
  tournamentSubtitle: "2026 - Respeito e União",
  tournamentOrganizer: "Organizado pela Loja José Moreira",
  tournamentLogo: "/logo-campeonato.jpg",
  tournamentMusic: "/musica-fundo.mp3",
  tournamentBackground: "",
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = trpc.settings.getAll.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const settings: TournamentSettings = {
    tournamentName: data?.tournamentName || defaultSettings.tournamentName,
    tournamentSubtitle: data?.tournamentSubtitle || defaultSettings.tournamentSubtitle,
    tournamentOrganizer: data?.tournamentOrganizer || defaultSettings.tournamentOrganizer,
    tournamentLogo: data?.tournamentLogo || defaultSettings.tournamentLogo,
    tournamentMusic: data?.tournamentMusic || defaultSettings.tournamentMusic,
    tournamentBackground: data?.tournamentBackground || defaultSettings.tournamentBackground,
  };

  return (
    <TournamentContext.Provider value={{ settings, isLoading, refetch }}>
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within TournamentProvider");
  }
  return context;
}

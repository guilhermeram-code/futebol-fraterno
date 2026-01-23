import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface TournamentSettings {
  tournamentName: string;
  tournamentSubtitle: string;
  tournamentOrganizer: string;
  tournamentLogo: string;
  tournamentBackground: string;
  heroBackground: string;
}

interface TournamentContextType {
  settings: TournamentSettings;
  isLoading: boolean;
  refetch: () => void;
  campaignId: number;
}

const defaultSettings: TournamentSettings = {
  tournamentName: "",
  tournamentSubtitle: "",
  tournamentOrganizer: "",
  tournamentLogo: "",
  tournamentBackground: "",
  heroBackground: "",
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

interface TournamentProviderProps {
  children: ReactNode;
  campaignId?: number;
}

export function TournamentProvider({ children, campaignId = 1 }: TournamentProviderProps) {
  const { data, isLoading, refetch } = trpc.settings.getAll.useQuery(
    { campaignId },
    {
      staleTime: 1000 * 30, // 30 seconds - mais responsivo para atualizações
    }
  );

  // Se ainda está carregando e não tem dados, retorna valores vazios para evitar flash
  const settings: TournamentSettings = isLoading && !data ? defaultSettings : {
    tournamentName: data?.tournamentName || "",
    tournamentSubtitle: data?.tournamentSubtitle || "",
    tournamentOrganizer: data?.tournamentOrganizer || "",
    tournamentLogo: data?.tournamentLogo || "",
    tournamentBackground: data?.tournamentBackground || "",
    heroBackground: data?.heroBackground || "",
  };

  return (
    <TournamentContext.Provider value={{ settings, isLoading, refetch, campaignId }}>
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

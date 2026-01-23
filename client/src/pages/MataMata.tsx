import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Trophy, Target } from "lucide-react";
import { useTournament } from "@/contexts/TournamentContext";

export default function MataMata() {
  const { campaignId } = useTournament();
  const { data: round16Matches } = trpc.matches.byPhase.useQuery({ phase: "round16", campaignId });
  const { data: quarterMatches } = trpc.matches.byPhase.useQuery({ phase: "quarters", campaignId });
  const { data: semiMatches } = trpc.matches.byPhase.useQuery({ phase: "semis", campaignId });
  const { data: finalMatch } = trpc.matches.byPhase.useQuery({ phase: "final", campaignId });
  const { data: teams } = trpc.teams.list.useQuery({ campaignId });

  const getTeamName = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.name || "A definir";
  };

  const getTeamLogo = (teamId: number): string | undefined => {
    const logo = teams?.find(t => t.id === teamId)?.logoUrl;
    return logo || undefined;
  };

  const getTeamLodge = (teamId: number) => {
    return teams?.find(t => t.id === teamId)?.lodge || "";
  };

  const hasKnockoutMatches = (round16Matches?.length || 0) > 0 || 
    (quarterMatches?.length || 0) > 0 || 
    (semiMatches?.length || 0) > 0 || 
    (finalMatch?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        {!hasKnockoutMatches ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Fase de Mata-Mata</h2>
              <p className="text-muted-foreground mb-4">
                As chaves serão definidas após a conclusão da fase de grupos.
              </p>
              <p className="text-sm text-muted-foreground">
                Os 2 primeiros de cada grupo se classificam para as oitavas de final.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Bracket Visual */}
            <div className="overflow-x-auto">
              <div className="min-w-[1000px] p-4">
                <div className="flex justify-between items-center gap-4">
                  {/* Oitavas de Final - Lado Esquerdo */}
                  <div className="space-y-4 flex-shrink-0">
                    <h3 className="text-center font-bold text-gold-dark mb-4">Oitavas</h3>
                    {round16Matches?.filter(m => m.bracketSide === 'left').map((match, index) => (
                      <BracketMatch 
                        key={match.id} 
                        match={match} 
                        getTeamName={getTeamName}
                        getTeamLogo={getTeamLogo}
                        getTeamLodge={getTeamLodge}
                      />
                    ))}
                  </div>

                  {/* Quartas - Lado Esquerdo */}
                  <div className="space-y-8 flex-shrink-0">
                    <h3 className="text-center font-bold text-gold-dark mb-4">Quartas</h3>
                    {quarterMatches?.filter(m => m.bracketSide === 'left').map((match, index) => (
                      <BracketMatch 
                        key={match.id} 
                        match={match} 
                        getTeamName={getTeamName}
                        getTeamLogo={getTeamLogo}
                        getTeamLodge={getTeamLodge}
                        size="lg"
                      />
                    ))}
                  </div>

                  {/* Semi - Lado Esquerdo */}
                  <div className="space-y-16 flex-shrink-0">
                    <h3 className="text-center font-bold text-gold-dark mb-4">Semi</h3>
                    {semiMatches?.filter(m => m.bracketSide === 'left').map((match, index) => (
                      <BracketMatch 
                        key={match.id} 
                        match={match} 
                        getTeamName={getTeamName}
                        getTeamLogo={getTeamLogo}
                        getTeamLodge={getTeamLodge}
                        size="lg"
                      />
                    ))}
                  </div>

                  {/* Final */}
                  <div className="flex-shrink-0">
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <Trophy className="h-12 w-12 text-gold trophy-shine" />
                      <h3 className="text-center font-bold text-gold-dark">Final</h3>
                    </div>
                    <div className="relative">
                      {finalMatch && finalMatch.length > 0 ? (
                        <BracketMatch 
                          match={finalMatch[0]} 
                          getTeamName={getTeamName}
                          getTeamLogo={getTeamLogo}
                          getTeamLodge={getTeamLodge}
                          size="xl"
                          isFinal
                        />
                      ) : (
                        <div className="w-48 p-4 bg-gold-gradient rounded-lg text-center">
                          <p className="text-primary-foreground font-bold">Final</p>
                          <p className="text-primary-foreground/70 text-sm">A definir</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Semi - Lado Direito */}
                  <div className="space-y-16 flex-shrink-0">
                    <h3 className="text-center font-bold text-gold-dark mb-4">Semi</h3>
                    {semiMatches?.filter(m => m.bracketSide === 'right').map((match, index) => (
                      <BracketMatch 
                        key={match.id} 
                        match={match} 
                        getTeamName={getTeamName}
                        getTeamLogo={getTeamLogo}
                        getTeamLodge={getTeamLodge}
                        size="lg"
                      />
                    ))}
                  </div>

                  {/* Quartas - Lado Direito */}
                  <div className="space-y-8 flex-shrink-0">
                    <h3 className="text-center font-bold text-gold-dark mb-4">Quartas</h3>
                    {quarterMatches?.filter(m => m.bracketSide === 'right').map((match, index) => (
                      <BracketMatch 
                        key={match.id} 
                        match={match} 
                        getTeamName={getTeamName}
                        getTeamLogo={getTeamLogo}
                        getTeamLodge={getTeamLodge}
                        size="lg"
                      />
                    ))}
                  </div>

                  {/* Oitavas de Final - Lado Direito */}
                  <div className="space-y-4 flex-shrink-0">
                    <h3 className="text-center font-bold text-gold-dark mb-4">Oitavas</h3>
                    {round16Matches?.filter(m => m.bracketSide === 'right').map((match, index) => (
                      <BracketMatch 
                        key={match.id} 
                        match={match} 
                        getTeamName={getTeamName}
                        getTeamLogo={getTeamLogo}
                        getTeamLodge={getTeamLodge}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Jogos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Oitavas */}
              {round16Matches && round16Matches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gold-dark">Oitavas de Final</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {round16Matches.map(match => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          getTeamName={getTeamName}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quartas */}
              {quarterMatches && quarterMatches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gold-dark">Quartas de Final</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quarterMatches.map(match => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          getTeamName={getTeamName}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Semifinais */}
              {semiMatches && semiMatches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gold-dark">Semifinais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {semiMatches.map(match => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          getTeamName={getTeamName}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final */}
              {finalMatch && finalMatch.length > 0 && (
                <Card className="border-2 border-primary">
                  <CardHeader className="bg-gold-gradient">
                    <CardTitle className="text-primary-foreground flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Grande Final
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {finalMatch.map(match => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          getTeamName={getTeamName}
                          isFinal
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

    </div>
  );
}

interface BracketMatchProps {
  match: any;
  getTeamName: (id: number) => string;
  getTeamLogo?: (id: number) => string | undefined;
  getTeamLodge?: (id: number) => string;
  size?: "sm" | "lg" | "xl";
  isFinal?: boolean;
}

function BracketMatch({ match, getTeamName, getTeamLogo, getTeamLodge, size = "sm", isFinal }: BracketMatchProps) {
  const sizeClasses = {
    sm: "w-40 text-xs",
    lg: "w-44 text-sm",
    xl: "w-52 text-base"
  };

  const homeWon = match.played && match.homeScore > match.awayScore;
  const awayWon = match.played && match.awayScore > match.homeScore;

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden shadow-md ${isFinal ? "border-2 border-primary" : "border border-border"}`}>
      <div className={`p-2 flex items-center justify-between ${homeWon ? "bg-green-100" : "bg-card"}`}>
        <div className="flex-1 truncate">
          <div className={`${homeWon ? "font-bold text-green-700" : ""}`}>
            {getTeamName(match.homeTeamId)}
          </div>
          {getTeamLodge && getTeamLodge(match.homeTeamId) && (
            <div className="text-[10px] text-muted-foreground">{getTeamLodge(match.homeTeamId)}</div>
          )}
        </div>
        <span className={`font-bold ml-2 score-display ${homeWon ? "text-green-700" : ""}`}>
          {match.played ? match.homeScore : "-"}
        </span>
      </div>
      <div className={`p-2 flex items-center justify-between border-t ${awayWon ? "bg-green-100" : "bg-card"}`}>
        <div className="flex-1 truncate">
          <div className={`${awayWon ? "font-bold text-green-700" : ""}`}>
            {getTeamName(match.awayTeamId)}
          </div>
          {getTeamLodge && getTeamLodge(match.awayTeamId) && (
            <div className="text-[10px] text-muted-foreground">{getTeamLodge(match.awayTeamId)}</div>
          )}
        </div>
        <span className={`font-bold ml-2 score-display ${awayWon ? "text-green-700" : ""}`}>
          {match.played ? match.awayScore : "-"}
        </span>
      </div>
      {match.penalties && (
        <div className="p-1 bg-muted text-center text-xs">
          Pênaltis: {match.homePenalties} x {match.awayPenalties}
        </div>
      )}
    </div>
  );
}

interface MatchCardProps {
  match: any;
  getTeamName: (id: number) => string;
  isFinal?: boolean;
}

function MatchCard({ match, getTeamName, isFinal }: MatchCardProps) {
  const homeWon = match.played && match.homeScore > match.awayScore;
  const awayWon = match.played && match.awayScore > match.homeScore;

  return (
    <div className={`p-3 rounded-lg ${isFinal ? "bg-gold-gradient-light" : "bg-muted"}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`font-medium ${homeWon ? "text-green-600 font-bold" : ""}`}>
            {getTeamName(match.homeTeamId)}
          </p>
        </div>
        <div className="px-4 text-center">
          {match.played ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold score-display">{match.homeScore}</span>
              <span className="text-muted-foreground">x</span>
              <span className="text-xl font-bold score-display">{match.awayScore}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">vs</span>
          )}
        </div>
        <div className="flex-1 text-right">
          <p className={`font-medium ${awayWon ? "text-green-600 font-bold" : ""}`}>
            {getTeamName(match.awayTeamId)}
          </p>
        </div>
      </div>
      {match.penalties && (
        <p className="text-center text-xs text-muted-foreground mt-1">
          Pênaltis: {match.homePenalties} x {match.awayPenalties}
        </p>
      )}
    </div>
  );
}

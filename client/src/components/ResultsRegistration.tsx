import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Target, AlertTriangle, Check, X } from "lucide-react";

interface GoalEntry {
  playerId: string;
  teamId: number;
}

interface CardEntry {
  playerId: string;
  teamId: number;
  cardType: "yellow" | "red";
}

export function ResultsRegistration() {
  const utils = trpc.useUtils();
  const { data: matches } = trpc.matches.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: players } = trpc.players.list.useQuery();
  
  const registerResult = trpc.matches.registerResult.useMutation({
    onSuccess: () => {
      utils.matches.list.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });
  
  const createGoal = trpc.goals.create.useMutation({
    onSuccess: () => {
      utils.goals.topScorers.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });
  
  const createCard = trpc.cards.create.useMutation({
    onSuccess: () => {
      utils.cards.topCarded.invalidate();
    },
    onError: (error) => toast.error(error.message)
  });

  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [penalties, setPenalties] = useState(false);
  const [homePenalties, setHomePenalties] = useState("");
  const [awayPenalties, setAwayPenalties] = useState("");
  
  // Step control
  const [step, setStep] = useState<"result" | "goals" | "cards" | "done">("result");
  
  // Goals entries
  const [homeGoals, setHomeGoals] = useState<GoalEntry[]>([]);
  const [awayGoals, setAwayGoals] = useState<GoalEntry[]>([]);
  
  // Cards entries
  const [cards, setCards] = useState<CardEntry[]>([]);
  const [newCardPlayerId, setNewCardPlayerId] = useState("");
  const [newCardTeamId, setNewCardTeamId] = useState("");
  const [newCardType, setNewCardType] = useState<"yellow" | "red">("yellow");

  const getTeamName = (id: number) => teams?.find(t => t.id === id)?.name || "Time";
  const getPlayersByTeam = (teamId: number) => players?.filter(p => p.teamId === teamId) || [];
  
  const pendingMatches = matches?.filter(m => !m.played) || [];
  const selectedMatchData = matches?.find(m => m.id === selectedMatch);

  // Initialize goal entries when score is set
  useEffect(() => {
    if (homeScore && awayScore && selectedMatchData) {
      const homeCount = parseInt(homeScore) || 0;
      const awayCount = parseInt(awayScore) || 0;
      
      setHomeGoals(Array(homeCount).fill(null).map(() => ({ 
        playerId: "", 
        teamId: selectedMatchData.homeTeamId 
      })));
      
      setAwayGoals(Array(awayCount).fill(null).map(() => ({ 
        playerId: "", 
        teamId: selectedMatchData.awayTeamId 
      })));
    }
  }, [homeScore, awayScore, selectedMatchData]);

  const handleSaveResult = () => {
    if (!selectedMatch) return;
    
    const homeCount = parseInt(homeScore) || 0;
    const awayCount = parseInt(awayScore) || 0;
    
    if (homeCount === 0 && awayCount === 0) {
      // 0x0 - go directly to cards
      setStep("cards");
    } else {
      // Has goals - go to goals step
      setStep("goals");
    }
  };

  const updateHomeGoal = (index: number, playerId: string) => {
    const newGoals = [...homeGoals];
    newGoals[index] = { ...newGoals[index], playerId };
    setHomeGoals(newGoals);
  };

  const updateAwayGoal = (index: number, playerId: string) => {
    const newGoals = [...awayGoals];
    newGoals[index] = { ...newGoals[index], playerId };
    setAwayGoals(newGoals);
  };

  const allGoalsFilled = () => {
    const homeOk = homeGoals.every(g => g.playerId !== "");
    const awayOk = awayGoals.every(g => g.playerId !== "");
    return homeOk && awayOk;
  };

  const handleConfirmGoals = () => {
    if (!allGoalsFilled()) {
      toast.error("Preencha todos os gols antes de continuar!");
      return;
    }
    setStep("cards");
  };

  const addCard = () => {
    if (!newCardPlayerId || !newCardTeamId) {
      toast.error("Selecione o time e o jogador!");
      return;
    }
    setCards([...cards, {
      playerId: newCardPlayerId,
      teamId: parseInt(newCardTeamId),
      cardType: newCardType
    }]);
    setNewCardPlayerId("");
    setNewCardTeamId("");
    setNewCardType("yellow");
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleFinalize = async () => {
    if (!selectedMatch) return;
    
    try {
      // 1. Register result
      await registerResult.mutateAsync({
        matchId: selectedMatch,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        penalties: penalties || undefined,
        homePenalties: penalties ? parseInt(homePenalties) : undefined,
        awayPenalties: penalties ? parseInt(awayPenalties) : undefined
      });
      
      // 2. Register all goals
      for (const goal of [...homeGoals, ...awayGoals]) {
        if (goal.playerId) {
          await createGoal.mutateAsync({
            matchId: selectedMatch,
            playerId: parseInt(goal.playerId),
            teamId: goal.teamId
          });
        }
      }
      
      // 3. Register all cards
      for (const card of cards) {
        await createCard.mutateAsync({
          matchId: selectedMatch,
          playerId: parseInt(card.playerId),
          teamId: card.teamId,
          cardType: card.cardType
        });
      }
      
      toast.success("Resultado registrado com sucesso!");
      setStep("done");
      
      // Reset form
      setTimeout(() => {
        setSelectedMatch(null);
        setHomeScore("");
        setAwayScore("");
        setPenalties(false);
        setHomePenalties("");
        setAwayPenalties("");
        setHomeGoals([]);
        setAwayGoals([]);
        setCards([]);
        setStep("result");
      }, 2000);
      
    } catch (error) {
      toast.error("Erro ao salvar resultado!");
    }
  };

  const getPlayerName = (playerId: string, teamId: number) => {
    const player = players?.find(p => p.id === parseInt(playerId));
    return player ? `${player.number ? player.number + " - " : ""}${player.name}` : "";
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant={step === "result" ? "default" : "outline"}>1. Resultado</Badge>
        <span className="text-muted-foreground">→</span>
        <Badge variant={step === "goals" ? "default" : "outline"}>2. Gols</Badge>
        <span className="text-muted-foreground">→</span>
        <Badge variant={step === "cards" ? "default" : "outline"}>3. Cartões</Badge>
        <span className="text-muted-foreground">→</span>
        <Badge variant={step === "done" ? "default" : "outline"}>4. Concluído</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Select Match */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Jogo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {pendingMatches.length > 0 ? (
                pendingMatches.map(match => (
                  <div 
                    key={match.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMatch === match.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                    }`}
                    onClick={() => {
                      if (step === "result") {
                        setSelectedMatch(match.id);
                        setHomeScore("");
                        setAwayScore("");
                        setPenalties(false);
                        setHomeGoals([]);
                        setAwayGoals([]);
                        setCards([]);
                      }
                    }}
                  >
                    <p className="font-medium">
                      {getTeamName(match.homeTeamId)} vs {getTeamName(match.awayTeamId)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum jogo pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {selectedMatch && selectedMatchData && (
          <div className="space-y-6">
            {/* Step 1: Result */}
            {step === "result" && (
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Resultado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                      <p className="font-bold mb-2">{getTeamName(selectedMatchData.homeTeamId)}</p>
                      <Input 
                        type="number" 
                        value={homeScore} 
                        onChange={(e) => setHomeScore(e.target.value)}
                        className="text-center text-2xl"
                        min="0"
                      />
                    </div>
                    <div className="text-center text-2xl font-bold text-muted-foreground">X</div>
                    <div className="text-center">
                      <p className="font-bold mb-2">{getTeamName(selectedMatchData.awayTeamId)}</p>
                      <Input 
                        type="number" 
                        value={awayScore} 
                        onChange={(e) => setAwayScore(e.target.value)}
                        className="text-center text-2xl"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="penalties" 
                      checked={penalties}
                      onChange={(e) => setPenalties(e.target.checked)}
                    />
                    <Label htmlFor="penalties">Foi para pênaltis?</Label>
                  </div>

                  {penalties && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Pênaltis {getTeamName(selectedMatchData.homeTeamId)}</Label>
                        <Input 
                          type="number" 
                          value={homePenalties} 
                          onChange={(e) => setHomePenalties(e.target.value)}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label>Pênaltis {getTeamName(selectedMatchData.awayTeamId)}</Label>
                        <Input 
                          type="number" 
                          value={awayPenalties} 
                          onChange={(e) => setAwayPenalties(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleSaveResult} 
                    className="w-full"
                    disabled={homeScore === "" || awayScore === ""}
                  >
                    Próximo: Registrar Gols →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Goals */}
            {step === "goals" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Registrar Gols ({parseInt(homeScore) + parseInt(awayScore)} gols)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Home team goals */}
                  {homeGoals.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 text-primary">
                        {getTeamName(selectedMatchData.homeTeamId)} - {homeGoals.length} gol(s)
                      </h4>
                      <div className="space-y-2">
                        {homeGoals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}º gol</Badge>
                            <Select 
                              value={goal.playerId} 
                              onValueChange={(v) => updateHomeGoal(index, v)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Quem fez o gol?" />
                              </SelectTrigger>
                              <SelectContent>
                                {getPlayersByTeam(selectedMatchData.homeTeamId).map(p => (
                                  <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.number && `${p.number} - `}{p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {goal.playerId && <Check className="h-5 w-5 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Away team goals */}
                  {awayGoals.length > 0 && (
                    <div>
                      <h4 className="font-bold mb-3 text-primary">
                        {getTeamName(selectedMatchData.awayTeamId)} - {awayGoals.length} gol(s)
                      </h4>
                      <div className="space-y-2">
                        {awayGoals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}º gol</Badge>
                            <Select 
                              value={goal.playerId} 
                              onValueChange={(v) => updateAwayGoal(index, v)}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Quem fez o gol?" />
                              </SelectTrigger>
                              <SelectContent>
                                {getPlayersByTeam(selectedMatchData.awayTeamId).map(p => (
                                  <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.number && `${p.number} - `}{p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {goal.playerId && <Check className="h-5 w-5 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleConfirmGoals}
                    className="w-full"
                    disabled={!allGoalsFilled()}
                  >
                    Próximo: Registrar Cartões →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Cards */}
            {step === "cards" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Registrar Cartões (opcional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cards list */}
                  {cards.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <Label>Cartões adicionados:</Label>
                      {cards.map((card, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span>
                            {card.cardType === "yellow" ? "🟨" : "🟥"} {getPlayerName(card.playerId, card.teamId)} ({getTeamName(card.teamId)})
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => removeCard(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new card */}
                  <div className="space-y-3 border-t pt-4">
                    <Label>Adicionar cartão:</Label>
                    <Select value={newCardTeamId} onValueChange={setNewCardTeamId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={selectedMatchData.homeTeamId.toString()}>
                          {getTeamName(selectedMatchData.homeTeamId)}
                        </SelectItem>
                        <SelectItem value={selectedMatchData.awayTeamId.toString()}>
                          {getTeamName(selectedMatchData.awayTeamId)}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {newCardTeamId && (
                      <>
                        <Select value={newCardPlayerId} onValueChange={setNewCardPlayerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Quem recebeu o cartão?" />
                          </SelectTrigger>
                          <SelectContent>
                            {getPlayersByTeam(parseInt(newCardTeamId)).map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.number && `${p.number} - `}{p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={newCardType} onValueChange={(v) => setNewCardType(v as "yellow" | "red")}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yellow">🟨 Amarelo</SelectItem>
                            <SelectItem value="red">🟥 Vermelho</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button variant="outline" onClick={addCard} className="w-full">
                          + Adicionar Cartão
                        </Button>
                      </>
                    )}
                  </div>

                  <Button 
                    onClick={handleFinalize}
                    className="w-full mt-4"
                    disabled={registerResult.isPending || createGoal.isPending || createCard.isPending}
                  >
                    {(registerResult.isPending || createGoal.isPending || createCard.isPending) 
                      ? "Salvando..." 
                      : "✓ Finalizar e Salvar Tudo"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Done */}
            {step === "done" && (
              <Card>
                <CardContent className="py-8 text-center">
                  <Check className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Resultado Registrado!</h3>
                  <p className="text-muted-foreground">
                    {getTeamName(selectedMatchData.homeTeamId)} {homeScore} x {awayScore} {getTeamName(selectedMatchData.awayTeamId)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

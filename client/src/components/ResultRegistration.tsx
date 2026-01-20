import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Target, AlertTriangle } from "lucide-react";

interface GoalEntry {
  playerId: string;
  teamId: number;
}

interface CardEntry {
  playerId: string;
  teamId: number;
  cardType: "yellow" | "red";
}

interface ResultRegistrationProps {
  matchId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  onSuccess: () => void;
}

export function ResultRegistration({
  matchId,
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
  onSuccess
}: ResultRegistrationProps) {
  const utils = trpc.useUtils();
  const { data: players } = trpc.players.list.useQuery();
  
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [penalties, setPenalties] = useState(false);
  const [homePenalties, setHomePenalties] = useState("");
  const [awayPenalties, setAwayPenalties] = useState("");
  
  const [homeGoals, setHomeGoals] = useState<GoalEntry[]>([]);
  const [awayGoals, setAwayGoals] = useState<GoalEntry[]>([]);
  const [cards, setCards] = useState<CardEntry[]>([]);
  
  const [step, setStep] = useState(1); // 1 = placar, 2 = gols e cartões

  const registerResult = trpc.matches.registerResult.useMutation({
    onSuccess: () => {
      utils.matches.list.invalidate();
      toast.success("Resultado registrado com sucesso!");
      onSuccess();
    },
    onError: (error) => toast.error(error.message)
  });

  const createGoal = trpc.goals.create.useMutation();
  const createCard = trpc.cards.create.useMutation();

  const getPlayersByTeam = (teamId: number) => 
    players?.filter(p => p.teamId === teamId) || [];

  // Quando o placar muda, atualiza os arrays de gols
  useEffect(() => {
    const home = parseInt(homeScore) || 0;
    const away = parseInt(awayScore) || 0;
    
    setHomeGoals(Array(home).fill(null).map(() => ({ playerId: "", teamId: homeTeamId })));
    setAwayGoals(Array(away).fill(null).map(() => ({ playerId: "", teamId: awayTeamId })));
  }, [homeScore, awayScore, homeTeamId, awayTeamId]);

  const updateHomeGoal = (index: number, playerId: string) => {
    const newGoals = [...homeGoals];
    newGoals[index] = { playerId, teamId: homeTeamId };
    setHomeGoals(newGoals);
  };

  const updateAwayGoal = (index: number, playerId: string) => {
    const newGoals = [...awayGoals];
    newGoals[index] = { playerId, teamId: awayTeamId };
    setAwayGoals(newGoals);
  };

  const addCard = () => {
    setCards([...cards, { playerId: "", teamId: homeTeamId, cardType: "yellow" }]);
  };

  const updateCard = (index: number, field: keyof CardEntry, value: any) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  const removeCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!homeScore || !awayScore) {
      toast.error("Preencha o placar!");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    // Validar que todos os gols têm jogador selecionado
    const allHomeGoalsFilled = homeGoals.every(g => g.playerId);
    const allAwayGoalsFilled = awayGoals.every(g => g.playerId);
    
    if (!allHomeGoalsFilled || !allAwayGoalsFilled) {
      toast.error("Selecione o jogador de cada gol!");
      return;
    }

    // Validar cartões
    const allCardsFilled = cards.every(c => c.playerId);
    if (!allCardsFilled) {
      toast.error("Selecione o jogador de cada cartão!");
      return;
    }

    try {
      // 1. Registrar resultado
      await registerResult.mutateAsync({
        matchId,
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        penalties: penalties || undefined,
        homePenalties: penalties ? parseInt(homePenalties) : undefined,
        awayPenalties: penalties ? parseInt(awayPenalties) : undefined
      });

      // 2. Registrar todos os gols
      for (const goal of [...homeGoals, ...awayGoals]) {
        await createGoal.mutateAsync({
          matchId,
          playerId: parseInt(goal.playerId),
          teamId: goal.teamId
        });
      }

      // 3. Registrar todos os cartões
      for (const card of cards) {
        await createCard.mutateAsync({
          matchId,
          playerId: parseInt(card.playerId),
          teamId: card.teamId,
          cardType: card.cardType
        });
      }

      utils.goals.topScorers.invalidate();
      utils.cards.topCarded.invalidate();
      
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar resultado");
    }
  };

  if (step === 1) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passo 1: Registrar Placar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <p className="font-bold mb-2">{homeTeamName}</p>
              <Input 
                type="number" 
                value={homeScore} 
                onChange={(e) => setHomeScore(e.target.value)}
                className="text-center text-2xl"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="text-center text-2xl font-bold text-muted-foreground">X</div>
            <div className="text-center">
              <p className="font-bold mb-2">{awayTeamName}</p>
              <Input 
                type="number" 
                value={awayScore} 
                onChange={(e) => setAwayScore(e.target.value)}
                className="text-center text-2xl"
                min="0"
                placeholder="0"
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
                <Label>Pênaltis {homeTeamName}</Label>
                <Input 
                  type="number" 
                  value={homePenalties} 
                  onChange={(e) => setHomePenalties(e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Pênaltis {awayTeamName}</Label>
                <Input 
                  type="number" 
                  value={awayPenalties} 
                  onChange={(e) => setAwayPenalties(e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleNext} 
            className="w-full"
            disabled={!homeScore || !awayScore}
          >
            Próximo: Registrar Gols e Cartões
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Passo 2: Registrar Gols</span>
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Voltar ao Placar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gols do time da casa */}
          {homeGoals.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Gols de {homeTeamName} ({homeGoals.length})
              </h3>
              <div className="space-y-2">
                {homeGoals.map((goal, index) => (
                  <div key={index}>
                    <Label>Gol {index + 1}</Label>
                    <Select 
                      value={goal.playerId} 
                      onValueChange={(value) => updateHomeGoal(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Quem fez o gol?" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPlayersByTeam(homeTeamId).map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.number && `${p.number} - `}{p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gols do time visitante */}
          {awayGoals.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Gols de {awayTeamName} ({awayGoals.length})
              </h3>
              <div className="space-y-2">
                {awayGoals.map((goal, index) => (
                  <div key={index}>
                    <Label>Gol {index + 1}</Label>
                    <Select 
                      value={goal.playerId} 
                      onValueChange={(value) => updateAwayGoal(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Quem fez o gol?" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPlayersByTeam(awayTeamId).map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.number && `${p.number} - `}{p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cartões (opcional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Cartões (Opcional)
            </span>
            <Button variant="outline" size="sm" onClick={addCard}>
              Adicionar Cartão
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cards.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum cartão registrado
            </p>
          ) : (
            cards.map((card, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Time</Label>
                  <Select 
                    value={card.teamId.toString()} 
                    onValueChange={(value) => updateCard(index, "teamId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={homeTeamId.toString()}>{homeTeamName}</SelectItem>
                      <SelectItem value={awayTeamId.toString()}>{awayTeamName}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Label>Jogador</Label>
                  <Select 
                    value={card.playerId} 
                    onValueChange={(value) => updateCard(index, "playerId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Quem recebeu?" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPlayersByTeam(card.teamId).map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.number && `${p.number} - `}{p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Label>Tipo</Label>
                  <Select 
                    value={card.cardType} 
                    onValueChange={(value: "yellow" | "red") => updateCard(index, "cardType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">Amarelo</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeCard(index)}
                >
                  ×
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={registerResult.isPending || createGoal.isPending || createCard.isPending}
        size="lg"
      >
        {registerResult.isPending ? "Salvando..." : "Finalizar e Salvar Tudo"}
      </Button>
    </div>
  );
}

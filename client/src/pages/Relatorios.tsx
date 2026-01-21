import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { 
  FileText, 
  Download, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Trophy, 
  Users, 
  Target,
  Share2
} from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { toast } from "sonner";

export default function Relatorios() {
  const { data: groups } = trpc.groups.list.useQuery();
  const { data: teams } = trpc.teams.list.useQuery();
  const { data: matches } = trpc.matches.list.useQuery();
  const { data: topScorers } = trpc.stats.topScorers.useQuery({ limit: 10 });
  const { data: settings } = trpc.settings.getAll.useQuery();
  
  const [generating, setGenerating] = useState<string | null>(null);

  const tournamentName = settings?.tournamentName || "Campeonato";

  // Função para gerar PDF visual (para WhatsApp)
  const generateVisualPDF = async () => {
    setGenerating("visual");
    try {
      // Criar conteúdo HTML para o PDF visual
      const content = generateVisualContent();
      
      // Criar blob e download
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournamentName.replace(/\s+/g, '_')}_resumo.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Relatório visual gerado! Abra o arquivo HTML e salve como PDF.");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setGenerating(null);
    }
  };

  // Função para gerar PDF gerencial
  const generateManagerialPDF = async () => {
    setGenerating("gerencial");
    try {
      const content = generateManagerialContent();
      
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tournamentName.replace(/\s+/g, '_')}_gerencial.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Relatório gerencial gerado! Abra o arquivo HTML e salve como PDF.");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setGenerating(null);
    }
  };

  // Função para gerar CSV
  const generateCSV = async (type: 'classificacao' | 'artilharia' | 'jogos') => {
    setGenerating(type);
    try {
      let csvContent = "";
      let filename = "";

      if (type === 'classificacao') {
        csvContent = generateClassificacaoCSV();
        filename = "classificacao.csv";
      } else if (type === 'artilharia') {
        csvContent = generateArtilhariaCSV();
        filename = "artilharia.csv";
      } else {
        csvContent = generateJogosCSV();
        filename = "jogos.csv";
      }

      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`${filename} gerado com sucesso!`);
    } catch (error) {
      toast.error("Erro ao gerar CSV");
    } finally {
      setGenerating(null);
    }
  };

  // Gerar conteúdo visual HTML
  const generateVisualContent = () => {
    const playedMatches = matches?.filter(m => m.played) || [];
    const totalGoals = playedMatches.reduce((acc, m) => acc + (m.homeScore || 0) + (m.awayScore || 0), 0);
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${tournamentName} - Resumo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', sans-serif; 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 600px; margin: 0 auto; }
    .header { 
      text-align: center; 
      padding: 30px 0;
      border-bottom: 2px solid #d4af37;
      margin-bottom: 30px;
    }
    .header h1 { 
      color: #d4af37; 
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header p { color: #888; font-size: 14px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    }
    .stat-card .number { 
      font-size: 32px; 
      font-weight: bold; 
      color: #d4af37;
    }
    .stat-card .label { font-size: 12px; color: #888; }
    .section { margin-bottom: 30px; }
    .section h2 { 
      color: #d4af37; 
      font-size: 18px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { 
      padding: 10px; 
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .table th { color: #d4af37; font-size: 12px; }
    .table tr:nth-child(even) { background: rgba(255,255,255,0.05); }
    .footer { 
      text-align: center; 
      padding: 20px;
      color: #666;
      font-size: 12px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚽ ${tournamentName}</h1>
      <p>Resumo do Campeonato</p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="number">${teams?.length || 0}</div>
        <div class="label">Times</div>
      </div>
      <div class="stat-card">
        <div class="number">${playedMatches.length}</div>
        <div class="label">Jogos</div>
      </div>
      <div class="stat-card">
        <div class="number">${totalGoals}</div>
        <div class="label">Gols</div>
      </div>
    </div>

    <div class="section">
      <h2>🏆 Artilharia</h2>
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Jogador</th>
            <th>Gols</th>
          </tr>
        </thead>
        <tbody>
          ${topScorers?.slice(0, 5).map((scorer, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${scorer.playerId}</td>
              <td>${scorer.goalCount}</td>
            </tr>
          `).join('') || '<tr><td colspan="3">Sem dados</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    </div>
  </div>
</body>
</html>
    `;
  };

  // Gerar conteúdo gerencial HTML
  const generateManagerialContent = () => {
    const playedMatches = matches?.filter(m => m.played) || [];
    
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${tournamentName} - Relatório Gerencial</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', sans-serif; 
      background: white;
      color: #333;
      padding: 40px;
    }
    .header { 
      text-align: center; 
      padding: 20px 0;
      border-bottom: 2px solid #d4af37;
      margin-bottom: 30px;
    }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { color: #666; font-size: 12px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    .section h2 { 
      font-size: 16px;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    .table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .table th, .table td { 
      padding: 8px; 
      text-align: left;
      border: 1px solid #ddd;
    }
    .table th { background: #f5f5f5; font-weight: bold; }
    .table tr:nth-child(even) { background: #fafafa; }
    .footer { 
      text-align: center; 
      padding: 20px;
      color: #999;
      font-size: 10px;
      border-top: 1px solid #ddd;
      margin-top: 30px;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${tournamentName}</h1>
    <p>Relatório Gerencial Completo</p>
  </div>

  <div class="section">
    <h2>Resumo Geral</h2>
    <table class="table">
      <tr>
        <td><strong>Total de Times</strong></td>
        <td>${teams?.length || 0}</td>
        <td><strong>Total de Grupos</strong></td>
        <td>${groups?.length || 0}</td>
      </tr>
      <tr>
        <td><strong>Jogos Realizados</strong></td>
        <td>${playedMatches.length}</td>
        <td><strong>Jogos Pendentes</strong></td>
        <td>${(matches?.length || 0) - playedMatches.length}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Times por Grupo</h2>
    ${groups?.map(group => {
      const groupTeams = teams?.filter(t => t.groupId === group.id) || [];
      return `
        <h3 style="margin: 10px 0 5px; font-size: 14px;">${group.name}</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Loja</th>
            </tr>
          </thead>
          <tbody>
            ${groupTeams.map(team => `
              <tr>
                <td>${team.name}</td>
                <td>${team.lodge || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }).join('') || ''}
  </div>

  <div class="section">
    <h2>Artilharia</h2>
    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Jogador</th>
          <th>Gols</th>
        </tr>
      </thead>
      <tbody>
        ${topScorers?.map((scorer, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${scorer.playerId}</td>
            <td>${scorer.goalCount}</td>
          </tr>
        `).join('') || '<tr><td colspan="3">Sem dados</td></tr>'}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Relatório gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
  </div>
</body>
</html>
    `;
  };

  // Gerar CSV de classificação
  const generateClassificacaoCSV = () => {
    let csv = "Grupo,Posição,Time,Loja,J,V,E,D,GP,GC,SG,Pts\n";
    
    groups?.forEach(group => {
      const groupTeams = teams?.filter(t => t.groupId === group.id) || [];
      groupTeams.forEach((team, idx) => {
        csv += `${group.name},${idx + 1},${team.name},${team.lodge || ''},0,0,0,0,0,0,0,0\n`;
      });
    });
    
    return csv;
  };

  // Gerar CSV de artilharia
  const generateArtilhariaCSV = () => {
    let csv = "Posição,Jogador,Time,Gols\n";
    
    topScorers?.forEach((scorer, idx) => {
      csv += `${idx + 1},${scorer.playerId},${scorer.teamId},${scorer.goalCount}\n`;
    });
    
    return csv;
  };

  // Gerar CSV de jogos
  const generateJogosCSV = () => {
    let csv = "Data,Mandante,Placar,Visitante,Fase,Status\n";
    
    matches?.forEach(match => {
      const homeTeam = teams?.find(t => t.id === match.homeTeamId)?.name || match.homeTeamId;
      const awayTeam = teams?.find(t => t.id === match.awayTeamId)?.name || match.awayTeamId;
      const placar = match.played ? `${match.homeScore} x ${match.awayScore}` : '-';
      const fase = match.phase === 'groups' ? 'Grupos' : 'Mata-Mata';
      const status = match.played ? 'Realizado' : 'Pendente';
      
      csv += `${match.matchDate || ''},${homeTeam},${placar},${awayTeam},${fase},${status}\n`;
    });
    
    return csv;
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      <Header />

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios do campeonato para compartilhar ou análise
          </p>
        </div>

        <Tabs defaultValue="pdf" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">
              <FileText className="h-4 w-4 mr-2" />
              PDF / HTML
            </TabsTrigger>
            <TabsTrigger value="excel">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel / CSV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="space-y-4">
            {/* Relatório Visual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-gold" />
                  Relatório Visual (WhatsApp)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Resumo visual do campeonato, ideal para compartilhar no WhatsApp.
                  Inclui estatísticas gerais e artilharia em formato compacto.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Estatísticas gerais</Badge>
                  <Badge variant="outline">Top 5 artilheiros</Badge>
                  <Badge variant="outline">Design moderno</Badge>
                </div>
                <Button 
                  className="mt-4 w-full sm:w-auto"
                  onClick={generateVisualPDF}
                  disabled={generating === "visual"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating === "visual" ? "Gerando..." : "Gerar Relatório Visual"}
                </Button>
              </CardContent>
            </Card>

            {/* Relatório Gerencial */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gold" />
                  Relatório Gerencial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Relatório completo para análise gerencial.
                  Inclui todos os dados do campeonato em formato profissional.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Resumo geral</Badge>
                  <Badge variant="outline">Times por grupo</Badge>
                  <Badge variant="outline">Artilharia completa</Badge>
                  <Badge variant="outline">Pronto para impressão</Badge>
                </div>
                <Button 
                  className="mt-4 w-full sm:w-auto"
                  onClick={generateManagerialPDF}
                  disabled={generating === "gerencial"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {generating === "gerencial" ? "Gerando..." : "Gerar Relatório Gerencial"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="excel" className="space-y-4">
            {/* CSV Classificação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tabela de classificação de todos os grupos em formato CSV.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => generateCSV('classificacao')}
                  disabled={generating === "classificacao"}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {generating === "classificacao" ? "Gerando..." : "Baixar CSV"}
                </Button>
              </CardContent>
            </Card>

            {/* CSV Artilharia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-gold" />
                  Artilharia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Lista de artilheiros com gols marcados em formato CSV.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => generateCSV('artilharia')}
                  disabled={generating === "artilharia"}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {generating === "artilharia" ? "Gerando..." : "Baixar CSV"}
                </Button>
              </CardContent>
            </Card>

            {/* CSV Jogos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gold" />
                  Jogos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Lista completa de jogos com resultados em formato CSV.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => generateCSV('jogos')}
                  disabled={generating === "jogos"}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {generating === "jogos" ? "Gerando..." : "Baixar CSV"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AudioPlayer />
    </div>
  );
}

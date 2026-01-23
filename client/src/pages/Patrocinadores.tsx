import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { useTournament } from "@/contexts/TournamentContext";

export default function Patrocinadores() {
  const { campaignId } = useTournament();
  const { data: sponsors, isLoading } = trpc.sponsors.list.useQuery({ campaignId });
  const { data: sponsorMessage } = trpc.settings.get.useQuery({ key: "sponsorMessage", campaignId });
  const { data: settings } = trpc.settings.getAll.useQuery({ campaignId });

  // Separar por nível
  const tierA = sponsors?.filter(s => s.tier === "A" && s.active) || [];
  const tierB = sponsors?.filter(s => s.tier === "B" && s.active) || [];
  const tierC = sponsors?.filter(s => s.tier === "C" && s.active) || [];

  const championshipName = settings?.championshipName || "Futebol Fraterno 2026";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gold-dark flex items-center justify-center gap-2">
            <Star className="h-8 w-8" />
            Nossos Patrocinadores
          </h1>
          <p className="text-muted-foreground mt-2">
            {sponsorMessage || `Agradecemos o apoio de todos que tornam o ${championshipName} possível!`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        ) : (!sponsors || sponsors.length === 0) ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum patrocinador cadastrado ainda</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Tier A - Patrocinadores Principais */}
            {tierA.length > 0 && (
              <section>
                <div className="text-center mb-6">
                  <Badge className="bg-gold text-black text-lg px-4 py-2">
                    ⭐ Patrocinadores Principais
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tierA.map(sponsor => {
                    const link = sponsor.link 
                      ? (sponsor.link.startsWith('http') ? sponsor.link : `https://${sponsor.link}`)
                      : null;
                    return (
                      <Card key={sponsor.id} className="border-2 border-gold overflow-hidden hover:shadow-xl transition-shadow">
                        <CardContent className="p-6">
                          <div className="aspect-video bg-white rounded-lg flex items-center justify-center p-4 mb-4">
                            {sponsor.logoUrl ? (
                              <img 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-2xl font-bold text-center">{sponsor.name}</span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-center">{sponsor.name}</h3>
                          {sponsor.description && (
                            <p className="text-muted-foreground text-center mt-2">{sponsor.description}</p>
                          )}
                          {link && (
                            <a 
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 mt-4 text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Visitar site
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Tier B - Patrocinadores */}
            {tierB.length > 0 && (
              <section>
                <div className="text-center mb-6">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    🤝 Patrocinadores
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tierB.map(sponsor => {
                    const link = sponsor.link 
                      ? (sponsor.link.startsWith('http') ? sponsor.link : `https://${sponsor.link}`)
                      : null;
                    return (
                      <Card key={sponsor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-white rounded-lg flex items-center justify-center p-3 mb-3">
                            {sponsor.logoUrl ? (
                              <img 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-lg font-bold text-center">{sponsor.name}</span>
                            )}
                          </div>
                          <h3 className="font-bold text-center">{sponsor.name}</h3>
                          {sponsor.description && (
                            <p className="text-xs text-muted-foreground text-center mt-1">{sponsor.description}</p>
                          )}
                          {link && (
                            <a 
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1 mt-2 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Site
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Tier C - Apoiadores */}
            {tierC.length > 0 && (
              <section>
                <div className="text-center mb-6">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    💚 Apoiadores
                  </Badge>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {tierC.map(sponsor => {
                    const link = sponsor.link 
                      ? (sponsor.link.startsWith('http') ? sponsor.link : `https://${sponsor.link}`)
                      : null;
                    return (
                      <Card key={sponsor.id} className="overflow-hidden hover:shadow transition-shadow">
                        <CardContent className="p-3">
                          <div className="aspect-square bg-white rounded flex items-center justify-center p-2 mb-2">
                            {sponsor.logoUrl ? (
                              <img 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-sm font-medium text-center">{sponsor.name}</span>
                            )}
                          </div>
                          <p className="text-xs text-center font-medium truncate">{sponsor.name}</p>
                          {link && (
                            <a 
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-center mt-1"
                            >
                              <ExternalLink className="h-3 w-3 mx-auto text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-gold/10 to-gold-dark/10 border-gold">
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-bold mb-2">Quer ser um patrocinador?</h2>
            <p className="text-muted-foreground">
              Entre em contato com a organização do campeonato para saber como apoiar!
            </p>
          </CardContent>
        </Card>
      </main>

    </div>
  );
}

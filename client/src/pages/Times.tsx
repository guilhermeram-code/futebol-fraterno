import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Link } from "wouter";
import { Users, Shield, ChevronRight } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function Times() {
  const { data: teams, isLoading } = trpc.teams.list.useQuery();
  const { data: groups } = trpc.groups.list.useQuery();

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return null;
    return groups?.find(g => g.id === groupId)?.name;
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <Link key={team.id} href={`/times/${team.id}`}>
                <Card className="card-hover cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {team.logoUrl ? (
                        <img 
                          src={team.logoUrl} 
                          alt={team.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-primary"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-primary">
                          <Shield className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{team.name}</h3>
                        {team.lodge && (
                          <p className="text-sm text-muted-foreground">{team.lodge}</p>
                        )}
                        {team.groupId && (
                          <Badge variant="outline" className="mt-1">
                            {getGroupName(team.groupId)}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum time cadastrado ainda</p>
            </CardContent>
          </Card>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}

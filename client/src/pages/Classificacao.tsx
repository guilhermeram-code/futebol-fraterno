import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Link, useSearch } from "wouter";
import { Trophy, Users } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";

export default function Classificacao() {
  const searchParams = new URLSearchParams(useSearch());
  const selectedGroupId = searchParams.get("grupo");
  
  const { data: groups, isLoading: loadingGroups } = trpc.groups.list.useQuery();

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        {loadingGroups ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : groups && groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groups.map(group => (
              <GroupStandings key={group.id} groupId={group.id} groupName={group.name} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum grupo cadastrado ainda</p>
            </CardContent>
          </Card>
        )}
      </main>

      <AudioPlayer />
    </div>
  );
}

function GroupStandings({ groupId, groupName }: { groupId: number; groupName: string }) {
  const { data: standings, isLoading } = trpc.groups.standings.useQuery({ groupId });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-gold-dark">
          <Trophy className="h-5 w-5" />
          {groupName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {standings && standings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1">#</th>
                  <th className="text-left py-2 px-1">Time</th>
                  <th className="text-center py-2 px-1">P</th>
                  <th className="text-center py-2 px-1">J</th>
                  <th className="text-center py-2 px-1">V</th>
                  <th className="text-center py-2 px-1">E</th>
                  <th className="text-center py-2 px-1">D</th>
                  <th className="text-center py-2 px-1">GP</th>
                  <th className="text-center py-2 px-1">GC</th>
                  <th className="text-center py-2 px-1">SG</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, index) => (
                  <tr 
                    key={row.team.id} 
                    className={`border-b last:border-0 ${index < 2 ? "bg-green-50" : ""}`}
                  >
                    <td className="py-2 px-1">
                      <span className={`font-bold ${index < 2 ? "text-green-600" : ""}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-1">
                      <Link href={`/times/${row.team.id}`}>
                        <div className="hover:text-primary cursor-pointer">
                          <span className="font-medium">{row.team.name}</span>
                          {row.team.lodge && (
                            <span className="text-xs text-muted-foreground block">{row.team.lodge}</span>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="text-center py-2 px-1 font-bold text-gold-dark">{row.points}</td>
                    <td className="text-center py-2 px-1">{row.played}</td>
                    <td className="text-center py-2 px-1 text-green-600">{row.wins}</td>
                    <td className="text-center py-2 px-1 text-yellow-600">{row.draws}</td>
                    <td className="text-center py-2 px-1 text-red-600">{row.losses}</td>
                    <td className="text-center py-2 px-1">{row.goalsFor}</td>
                    <td className="text-center py-2 px-1">{row.goalsAgainst}</td>
                    <td className="text-center py-2 px-1">
                      <span className={row.goalDifference > 0 ? "text-green-600" : row.goalDifference < 0 ? "text-red-600" : ""}>
                        {row.goalDifference > 0 ? "+" : ""}{row.goalDifference}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Nenhum time neste grupo
          </p>
        )}
        <div className="mt-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Classificados para mata-mata
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

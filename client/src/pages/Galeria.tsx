import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Image, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { AudioPlayer } from "@/components/AudioPlayer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Galeria() {
  const { data: photos, isLoading } = trpc.photos.list.useQuery({ limit: 100 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openPhoto = (index: number) => {
    setSelectedIndex(index);
  };

  const closePhoto = () => {
    setSelectedIndex(null);
  };

  const nextPhoto = () => {
    if (selectedIndex !== null && photos) {
      setSelectedIndex((selectedIndex + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && photos) {
      setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
    }
  };

  const downloadPhoto = (url: string, caption: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = caption || 'foto-campeonato.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background masonic-pattern">
      {/* Header */}
      <Header />

      <main className="container py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openPhoto(index)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || "Foto do campeonato"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma foto na galeria ainda</p>
            </CardContent>
          </Card>
        )}

        {/* Photo Modal */}
        <Dialog open={selectedIndex !== null} onOpenChange={() => closePhoto()}>
          <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
            <DialogTitle className="sr-only">Visualização de foto</DialogTitle>
            {selectedIndex !== null && photos && photos[selectedIndex] && (
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={() => downloadPhoto(photos[selectedIndex].url, photos[selectedIndex].caption || 'foto')}
                  >
                    <Download className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20"
                    onClick={closePhoto}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                <img 
                  src={photos[selectedIndex].url} 
                  alt={photos[selectedIndex].caption || "Foto do campeonato"}
                  className="w-full max-h-[80vh] object-contain"
                />
                
                <div className="bg-black/80 p-4">
                  {photos[selectedIndex].caption && (
                    <p className="text-white text-center mb-2">{photos[selectedIndex].caption}</p>
                  )}
                  <div className="flex justify-between items-center text-white/60 text-sm">
                    <span>
                      {format(new Date(photos[selectedIndex].createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <span>
                      {selectedIndex + 1} / {photos.length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <AudioPlayer />
    </div>
  );
}

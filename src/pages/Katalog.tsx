import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import { PlayCircle, PauseCircle, Search, Music4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client from frontend project
import { toast } from 'sonner';

// Definisikan tipe data untuk sebuah lagu yang diharapkan dari Edge Function
type Track = {
  id: string; // ID dari database (UUID)
  title: string;
  artist: string;
  album: string;
  albumArtUrl: string; // URL ke cover album di GCS
  audioSrc: string; // URL ke file audio di GCS
  duration: number; // Durasi dalam detik
};

const KatalogPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL Edge Function Anda - Dibangun secara manual untuk menghindari masalah .getUrl()
  // Pastikan VITE_SUPABASE_URL sudah diatur di file .env Anda
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/get-catalog-tracks`;

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(edgeFunctionUrl);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Gagal memuat trek dari katalog.');
        }
        const data: Track[] = await response.json();
        setTracks(data);
        if (data.length > 0) {
          setCurrentTrack(data[0]); // Atur lagu pertama sebagai default
        }
      } catch (err) {
        console.error('Error fetching catalog tracks:', err);
        setError((err as Error).message || 'Terjadi kesalahan tak terduga.');
        toast.error((err as Error).message || 'Terjadi kesalahan tak terduga.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [edgeFunctionUrl]);

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">Memuat Musik...</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Mohon tunggu sebentar, kami sedang menyiapkan katalog untuk Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-96 w-full rounded-lg" />
            <div className="md:col-span-2 space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Error!</h1>
          <p className="text-lg text-muted-foreground">{error}</p>
          <p className="text-md text-muted-foreground mt-4">Pastikan Edge Function sudah dideploy dan secrets sudah diatur dengan benar.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Tidak Ada Musik Ditemukan</h1>
          <p className="text-lg text-muted-foreground">Belum ada trek yang tersedia di katalog.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">Temukan Musikmu</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Jelajahi ribuan lagu dari artis independen. Temukan soundtrack yang sempurna untuk proyek kreatif Anda berikutnya.
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input type="search" placeholder="Cari lagu, artis, atau genre..." className="pl-10 w-full" />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">Genre</Button>
                <Button variant="outline">Mood</Button>
                <Button variant="outline">Instrumen</Button>
            </div>
        </div>
        
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            
            <div className="md:col-span-1 p-6 flex flex-col items-center justify-center bg-muted/50">
              {currentTrack && (
                <>
                  <img
                    src={currentTrack.albumArtUrl || '/placeholder.svg'}
                    alt={`Album art for ${currentTrack.album}`}
                    className="w-full max-w-[256px] h-auto aspect-square rounded-lg shadow-lg object-cover mb-6"
                  />
                  <h2 className="text-2xl font-semibold text-center">{currentTrack.title}</h2>
                  <p className="text-muted-foreground mb-4">{currentTrack.artist}</p>
                  
                  <audio 
                    controls 
                    src={currentTrack.audioSrc} 
                    className="w-full"
                    key={currentTrack.id}
                    autoPlay
                  >
                    Browser Anda tidak mendukung elemen audio.
                  </audio>
                </>
              )}
            </div>

            <div className="md:col-span-2 p-6">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Daftar Lagu</h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
                {tracks.map((track) => (
                  <Button
                    key={track.id}
                    variant="ghost"
                    onClick={() => handleTrackSelect(track)}
                    className={cn(
                      'w-full flex items-center justify-start text-left h-auto p-3',
                      currentTrack?.id === track.id && 'bg-primary/10 text-primary'
                    )}
                  >
                    <div className="mr-4">
                      {currentTrack?.id === track.id ? (
                        <PauseCircle className="h-6 w-6 text-primary" />
                      ) : (
                        <PlayCircle className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold">{track.title}</p>
                      <p className="text-sm text-muted-foreground">{track.artist}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

          </div>
        </Card>

      </main>
      <Footer />
    </div>
  );
};

export default KatalogPage;
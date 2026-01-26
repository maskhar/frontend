import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, PauseCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Tipe data sesuai dengan output dari Edge Function Lovable
interface CatalogTrack {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  explicit_lyrics: boolean;
  duration: number | null;
}

interface CatalogRelease {
  id: string;
  title: string;
  artist_name: string;
  cover_url: string | null;
  release_type: string;
  tracks: CatalogTrack[];
}

// Tipe data yang "diratakan" untuk kemudahan UI
interface FlatTrack {
  id: string;
  title: string;
  artistName: string;
  albumTitle: string;
  albumArtUrl: string;
  audioSrc: string;
  isExplicit: boolean;
  duration: number | null;
}

const KatalogPage = () => {
  const [tracks, setTracks] = useState<FlatTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<FlatTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setError(null);

      // Endpoint dan Kunci API dari Proyek B (Lovable)
      const edgeFunctionUrl = 'https://opkvvdgnhhopkkeaokzo.supabase.co/functions/v1/get-catalog-tracks?limit=100&offset=0';
      const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3Z2ZGduaGhvcGtrZWFva3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjM5NDUsImV4cCI6MjA4MzU5OTk0NX0.UqDBz-xZYR5GluL7t3gItuJuWZipI9xlwt32KEIZrsc';

      try {
        const response = await fetch(edgeFunctionUrl, {
          method: 'GET', // Method adalah GET
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey, // Header apikey sesuai instruksi Lovable
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Gagal mengambil data katalog dari endpoint.');
        }
        
        const releases: CatalogRelease[] = data.data || [];

        const allTracks: FlatTrack[] = releases.flatMap(release => 
          (release.tracks || []).map(track => ({ // Tambahkan pengecekan jika tracks null/undefined
            id: track.id,
            title: track.title,
            artistName: release.artist_name,
            albumTitle: release.title,
            albumArtUrl: release.cover_url || '/placeholder.svg',
            audioSrc: track.audio_url,
            isExplicit: track.explicit_lyrics,
            duration: track.duration,
          }))
        );

        setTracks(allTracks);
        if (allTracks.length > 0) {
          setCurrentTrack(allTracks[0]);
        }

      } catch (err) {
        console.error('Error fetching catalog tracks:', err);
        const errorMessage = (err as Error).message || 'Terjadi kesalahan tak terduga.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleTrackSelect = (track: FlatTrack) => {
    setCurrentTrack(track);
  };
  
  // ... (Sisa dari JSX tidak perlu diubah)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">Memuat Musik...</h1>
            {/* ... */}
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
            {/* ... Filter buttons ... */}
        </div>
        
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            
            <div className="md:col-span-1 p-6 flex flex-col items-center justify-center bg-muted/50">
              {currentTrack && (
                <>
                  <img
                    src={currentTrack.albumArtUrl}
                    alt={`Album art for ${currentTrack.albumTitle}`}
                    className="w-full max-w-[256px] h-auto aspect-square rounded-lg shadow-lg object-cover mb-6"
                  />
                  <h2 className="text-2xl font-semibold text-center">{currentTrack.title}</h2>
                  <p className="text-muted-foreground mb-4">{currentTrack.artistName}</p>
                  
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
                      <p className="text-sm text-muted-foreground">{track.artistName}</p>
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

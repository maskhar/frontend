import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- Tipe Data dari Endpoint ---
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

// --- Tipe Data Internal untuk UI & Player ---
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
  const [allTracks, setAllTracks] = useState<FlatTrack[]>([]);
  const [featuredRelease, setFeaturedRelease] = useState<CatalogRelease | null>(null);
  const [nowPlaying, setNowPlaying] = useState<FlatTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentBlobUrl = useRef<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setError(null);
      const edgeFunctionUrl = `${import.meta.env.VITE_CATALOG_SUPABASE_URL}/functions/v1/get-catalog-tracks?limit=200&offset=0`;
      const anonKey = import.meta.env.VITE_CATALOG_SUPABASE_ANON_KEY;

      try {
        const response = await fetch(edgeFunctionUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Gagal mengambil data katalog.');
        
        const releases: CatalogRelease[] = data.data || [];

        if (releases.length > 0) {
          setFeaturedRelease(releases[0]); // Ambil rilisan pertama sebagai "unggulan"
          
          const flattenedTracks: FlatTrack[] = releases.flatMap(release => 
            (release.tracks || []).map(track => ({
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
          setAllTracks(flattenedTracks);
          // Jangan langsung mainkan lagu, biarkan pengguna memilih
        }
      } catch (err) {
        const errorMessage = (err as Error).message || 'Terjadi kesalahan tak terduga.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);
  
  const handlePlay = async (track: FlatTrack) => {
    if (nowPlaying?.id === track.id) {
      if (isPlaying) audioRef.current?.pause();
      else audioRef.current?.play();
      return;
    }

    if (!track.audioSrc) {
      toast.error("Sumber audio tidak ditemukan.");
      return;
    }
    
    if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
    
    setNowPlaying(track);
    setIsPlaying(false);
    
    try {
      const audioResponse = await fetch(track.audioSrc);
      const audioBlob = await audioResponse.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      currentBlobUrl.current = blobUrl;
      
      if (audioRef.current) {
        audioRef.current.src = blobUrl;
        audioRef.current.play();
      }
    } catch (err) {
      console.error("Error streaming audio:", err);
      toast.error("Gagal memuat audio.");
      setNowPlaying(null);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);
  
  const formatDuration = (seconds: number | null) => {
    if (seconds === null || isNaN(seconds)) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) { /* ... UI Loading ... */ }
  if (error) { /* ... UI Error ... */ }
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground" onContextMenu={(e) => e.preventDefault()}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {/* Header */}
        </div>
        
        {allTracks.length === 0 && !loading ? (
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Tidak Ada Musik Ditemukan</h1>
                <p className="text-lg text-muted-foreground">Belum ada trek yang tersedia di katalog.</p>
            </div>
        ) : (
            <Card className="overflow-hidden bg-gradient-to-b from-primary/10 to-background">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Kolom Kiri: Info Rilisan Unggulan */}
                <div className="md:col-span-4 p-6 flex flex-col items-center md:items-start text-center md:text-left">
                  {featuredRelease ? (
                    <>
                      <img
                        src={featuredRelease.cover_url || '/placeholder.svg'}
                        alt={`Cover for ${featuredRelease.title}`}
                        className="w-full max-w-[256px] md:max-w-full h-auto aspect-square rounded-lg shadow-lg object-cover mb-6"
                      />
                      <h2 className="text-3xl font-bold">{featuredRelease.title}</h2>
                      <p className="text-xl text-muted-foreground">{featuredRelease.artist_name}</p>
                    </>
                  ) : <Skeleton className="w-full aspect-square" />}
                </div>

                {/* Kolom Kanan: Daftar Lagu */}
                <div className="md:col-span-8 p-6">
                  <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                    {allTracks.map((track, index) => (
                      <div 
                        key={track.id} 
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md hover:bg-primary/10 group cursor-pointer",
                          nowPlaying?.id === track.id && "bg-primary/20"
                        )}
                        onClick={() => handlePlay(track)}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground w-6 text-center">{index + 1}</span>
                          <img src={track.albumArtUrl} alt={track.albumTitle} className="w-10 h-10 rounded-sm"/>
                          <div>
                            <p className={cn("font-semibold", nowPlaying?.id === track.id && "text-primary")}>{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artistName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground hidden md:block">{formatDuration(track.duration)}</span>
                            <Button variant="ghost" size="icon" className="group-hover:opacity-100 opacity-0 transition-opacity">
                              {nowPlaying?.id === track.id && isPlaying ? (
                                <PauseCircle className="h-6 w-6 text-primary" />
                              ) : (
                                <PlayCircle className="h-6 w-6" />
                              )}
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Card>
        )}
      </main>

      {/* Pemutar Bawah (Spotify Style) */}
      {nowPlaying && (
        <footer className="sticky bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img src={nowPlaying.albumArtUrl} alt={nowPlaying.albumTitle} className="w-14 h-14 rounded-md" />
              <div className="min-w-0">
                <p className="font-bold truncate">{nowPlaying.title}</p>
                <p className="text-sm text-muted-foreground truncate">{nowPlaying.artistName}</p>
              </div>
            </div>
            <audio ref={audioRef} className="hidden"/>
            <Button variant="ghost" size="icon" onClick={() => {
              if (isPlaying) audioRef.current?.pause();
              else audioRef.current?.play();
            }}>
              {isPlaying ? <PauseCircle className="h-8 w-8" /> : <PlayCircle className="h-8 w-8" />}
            </Button>
          </div>
        </footer>
      )}
      {!nowPlaying && <Footer />}
    </div>
  );
};

export default KatalogPage;

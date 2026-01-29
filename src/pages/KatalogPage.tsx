// src/pages/KatalogPage.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePlayer, Track } from '@/contexts/PlayerContext';
import { Music, Pause, Play } from 'lucide-react';

// --- Tipe Data ---
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

const PAGE_LIMIT = 50;

const KatalogPage = () => {
  const [releases, setReleases] = useState<CatalogRelease[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<CatalogRelease | null>(null);
  const [totalReleases, setTotalReleases] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { play, nowPlaying, isPlaying } = usePlayer();

  const fetchReleases = useCallback(async (currentOffset: number, search = "") => {
    if (currentOffset === 0) setLoading(true);
    else setLoadingMore(true);
    
    setError(null);
    let edgeFunctionUrl = `${import.meta.env.VITE_CATALOG_SUPABASE_URL}/functions/v1/get-catalog-tracks?limit=${PAGE_LIMIT}&offset=${currentOffset}`;
    if (search) {
      edgeFunctionUrl += `&search=${encodeURIComponent(search)}`;
    }

    const anonKey = import.meta.env.VITE_CATALOG_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'apikey': anonKey },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Gagal mengambil data katalog.');

      const fetchedReleases: CatalogRelease[] = data.data || [];
      
      // If it's a new search, replace. Otherwise, append safely with duplicate check.
      setReleases(prevReleases => {
        const existingReleases = currentOffset === 0 ? [] : prevReleases;
        const existingIds = new Set(existingReleases.map(r => r.id));
        const newUniqueReleases = fetchedReleases.filter(r => !existingIds.has(r.id));
        return [...existingReleases, ...newUniqueReleases];
      });

      setHasMore(data.pagination.hasMore);
      setOffset(currentOffset + PAGE_LIMIT);
      setTotalReleases(data.pagination.total || 0);

      // Only auto-select release on initial load, not on search
      if (currentOffset === 0 && fetchedReleases.length > 0 && !search) {
        setSelectedRelease(fetchedReleases[0]);
      }
      // If search returns results, select the first one.
      if (currentOffset === 0 && fetchedReleases.length > 0 && search) {
        setSelectedRelease(fetchedReleases[0]);
      } else if (currentOffset === 0 && fetchedReleases.length === 0) {
        setSelectedRelease(null); // Clear selection if search returns no results
      }

    } catch (err) {
      const errorMessage = (err as Error).message || 'Terjadi kesalahan tak terduga.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const handleSearch = () => {
    setOffset(0);
    setReleases([]); // Clear existing releases before new search
    setHasMore(true); // Reset hasMore
    fetchReleases(0, searchTerm);
  };

  useEffect(() => {
    fetchReleases(0, "");
  }, [fetchReleases]);

  const observer = useRef<IntersectionObserver>();
  const lastReleaseElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchReleases(offset);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, offset, fetchReleases]);
  
  const handlePlayFromTracklist = (tracks: CatalogTrack[], startIndex: number, release: CatalogRelease) => {
    const playlist: Track[] = tracks.map(track => ({ ...track, albumArtUrl: release.cover_url || '/placeholder.svg' }));
    play(playlist, startIndex);
  };

  const handleReleaseSelect = (release: CatalogRelease) => {
    setSelectedRelease(release);
    const isCurrentlySelectedAlbumPlaying = nowPlaying && release.tracks.some(t => t.id === nowPlaying.id);
    if (window.innerWidth < 768 && release.tracks && release.tracks.length > 0 && !isCurrentlySelectedAlbumPlaying) {
      handlePlayFromTracklist(release.tracks, 0, release);
    }
  };
  
  const formatDuration = (seconds: number | null) => {
    if (seconds === null || isNaN(seconds)) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (error && releases.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-12 text-center pt-24">
          <h1 className="text-4xl font-bold mb-4 text-red-600">Error!</h1>
          <p className="text-lg text-muted-foreground">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground" onContextMenu={(e) => e.preventDefault()}>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 pt-28 md:pt-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Temukan <span className="text-gradient">Rilisan Musik</span> Anda</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Jelajahi rilisan terbaru dari artis-artis independen.
          </p>
        </div>
        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto mb-12">
          <Input 
            type="text" 
            placeholder="Cari berdasarkan judul atau artis..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} // Optional: trigger search on Enter
          />
          <Button type="button" onClick={() => handleSearch()}>Cari</Button>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <main className="hidden md:block w-full md:w-1/3">
            <div className="sticky top-28">
              {loading && releases.length === 0 ? (
                <div className="flex flex-col gap-6 max-w-xs mx-auto">
                  <Skeleton className="w-full aspect-square" />
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-6 w-1/2 mx-auto" />
                </div>
              ) : selectedRelease ? (
                <div className="max-w-xs mx-auto">
                  <div className="text-center mb-8">
                    <img src={selectedRelease.cover_url || '/placeholder.svg'} alt={`Cover for ${selectedRelease.title}`} className="w-full h-auto aspect-square rounded-lg shadow-2xl object-cover mb-6 mx-auto" />
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-bold">{selectedRelease.title}</h2>
                        {(selectedRelease.tracks || []).some(track => track.explicit_lyrics === true) && (
                            <Badge variant="destructive">E</Badge>
                        )}
                    </div>
                    <p className="text-lg text-muted-foreground">{selectedRelease.artist_name}</p>
                    <p className="text-sm text-muted-foreground/80">{selectedRelease.genre}</p>
                  </div>
                  <div className="space-y-1">
                    {(selectedRelease.tracks || []).map((track, index) => (
                      <div key={track.id} className={cn("flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group cursor-pointer", nowPlaying?.id === track.id && "bg-primary/20")} onClick={() => handlePlayFromTracklist(selectedRelease.tracks, index, selectedRelease)}>
                        <div className="flex items-center gap-4">
                          <div className="w-6 text-center text-muted-foreground group-hover:hidden">
                            {nowPlaying?.id === track.id && isPlaying ? <Music size={16} className="animate-pulse text-primary"/> : (index + 1)}
                          </div>
                          <div className="w-6 text-center text-muted-foreground hidden group-hover:block">
                            {nowPlaying?.id === track.id && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                          </div>
                          <div>
                            <p className={cn("font-semibold", nowPlaying?.id === track.id && "text-primary")}>{track.title}</p>
                            <p className="text-sm text-muted-foreground">{track.artist_name}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatDuration(track.duration)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </main>
          <aside className="w-full md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">{totalReleases > 0 ? `${totalReleases} Rilisan Album Musik` : 'Perpustakaan'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {releases.map((release, index) => {
                const isLastElement = releases.length === index + 1;
                const isReleaseExplicit = (release.tracks || []).some(track => track.explicit_lyrics === true);
                return (
                  <div ref={isLastElement ? lastReleaseElementRef : null} key={release.id} className="cursor-pointer group" onClick={() => handleReleaseSelect(release)}>
                    <Card className={cn("overflow-hidden border-2 relative", selectedRelease?.id === release.id ? "border-primary" : "border-transparent")}>
                      <img src={release.cover_url || '/placeholder.svg'} alt={release.title} className="w-full h-auto object-cover aspect-square transition-transform group-hover:scale-105" />
                      {isReleaseExplicit && (
                        <Badge variant="destructive" className="absolute top-2 right-2">E</Badge>
                      )}
                    </Card>
                    <h3 className="font-semibold text-sm mt-2 truncate">{release.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{release.artist_name}</p>
                    <p className="text-[10px] text-muted-foreground/80 truncate">{release.genre}</p>
                  </div>
                );
              })}
              {loadingMore && Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="w-full aspect-square"/>)}
            </div>
            {!hasMore && releases.length > 0 && (
              <p className="text-center mt-8 text-muted-foreground">Anda telah mencapai akhir katalog.</p>
            )}
            {releases.length === 0 && !loading && (
              <p className="text-center mt-8 text-muted-foreground">Belum ada rilisan yang tersedia.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default KatalogPage;
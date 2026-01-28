// src/components/NowPlayingSheet.tsx
import { usePlayer } from '@/contexts/PlayerContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { 
    Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
    Volume2, Volume1, VolumeX, X, Music
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NowPlayingSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const NowPlayingSheet = ({ isOpen, onOpenChange }: NowPlayingSheetProps) => {
  const { 
    nowPlaying, isPlaying, togglePlayPause, playNext, playPrev, 
    duration, currentTime, seek, volume, setVolume,
    isShuffle, toggleShuffle, repeatMode, toggleRepeat,
    playlist
  } = usePlayer();

  if (!nowPlaying) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] flex flex-col bg-gradient-to-b from-primary/20 to-background border-none pt-8"> {/* Tambahkan pt-8 di sini */}
        <SheetHeader className="flex flex-row items-center justify-between p-4 pb-0"> {/* Hapus padding-bottom */}
          <SheetTitle className="text-center flex-1">Now Playing</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4 text-center">
            <img 
                src={nowPlaying.albumArtUrl} 
                alt={nowPlaying.title}
                className="w-full max-w-xs aspect-square rounded-lg shadow-2xl"
            />
            <div>
                <h2 className="text-2xl font-bold">{nowPlaying.title}</h2>
                <p className="text-lg text-muted-foreground">{nowPlaying.artist_name}</p>
            </div>
        </div>

        <div className="px-4 py-6">
            <div className="w-full flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">{formatDuration(currentTime)}</span>
                <Slider value={[currentTime]} max={duration} step={1} onValueChange={(value) => seek(value[0])} />
                <span className="text-xs text-muted-foreground">{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={toggleShuffle}>
                    <Shuffle className={cn("h-6 w-6", isShuffle && "text-primary")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={playPrev}>
                    <SkipBack className="h-8 w-8" />
                </Button>
                <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-20 w-20">
                    {isPlaying ? <Pause className="h-14 w-14" /> : <Play className="h-14 w-14" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={playNext}>
                    <SkipForward className="h-8 w-8" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleRepeat}>
                    {repeatMode === 'one' ? <Repeat1 className="h-6 w-6 text-primary" /> : <Repeat className={cn("h-6 w-6", repeatMode === 'all' && "text-primary")} />}
                </Button>
            </div>
            <div className="flex items-center justify-center gap-2">
                {volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
                <Slider className="w-[150px]" value={[volume]} max={1} step={0.01} onValueChange={(value) => setVolume(value[0])} />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8">
            <h3 className="font-bold text-lg mb-2">Up Next ({playlist.length} {playlist.length > 1 ? 'Tracks' : 'Track'})</h3>
            <div className="space-y-1">
                {playlist.map((track, index) => (
                    <div 
                        key={track.id} 
                        className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer",
                            nowPlaying.id === track.id ? "bg-primary/20 text-primary" : "hover:bg-muted/50"
                        )}
                        onClick={() => play(playlist, index)}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <span className="text-muted-foreground w-6 text-center flex-shrink-0">
                                {nowPlaying.id === track.id ? <Music size={16} className="animate-pulse"/> : (index + 1)}
                            </span>
                            <img src={track.albumArtUrl} alt={track.title} className="w-10 h-10 rounded-sm flex-shrink-0"/>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold truncate">{track.title}</p>
                                <p className="text-sm text-muted-foreground truncate">{track.artist_name}</p>
                            </div>
                        </div>
                        <span className="text-sm text-muted-foreground flex-shrink-0 ml-4">{formatDuration(track.duration)}</span>
                    </div>
                ))}
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

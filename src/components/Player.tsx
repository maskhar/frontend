// src/components/Player.tsx
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
    Play, Pause, SkipBack, SkipForward, 
    Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat1 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const Player = ({ onBarClick }: { onBarClick: () => void }) => {
    const { 
        nowPlaying, isPlaying, togglePlayPause, playNext, playPrev, 
        duration, currentTime, seek, volume, setVolume,
        isShuffle, toggleShuffle, repeatMode, toggleRepeat
    } = usePlayer();

    if (!nowPlaying) {
        return null;
    }

    return (
        <footer className="sticky bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t p-3">
            {/* --- Tampilan Desktop (md ke atas) --- */}
            <div className="container mx-auto hidden md:grid grid-cols-3 items-center gap-4">
                {/* Info Lagu */}
                <div className="flex items-center gap-4 min-w-0">
                    <img src={nowPlaying.albumArtUrl} alt={nowPlaying.title} className="w-14 h-14 rounded-md" />
                    <div className="min-w-0">
                        <p className="font-bold truncate">{nowPlaying.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{nowPlaying.artist_name}</p>
                    </div>
                </div>
                {/* Kontrol Utama & Progress Bar */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleShuffle}><Shuffle className={cn("h-5 w-5", isShuffle && "text-primary")} /></Button>
                        <Button variant="ghost" size="icon" onClick={playPrev}><SkipBack className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-12 w-12">{isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}</Button>
                        <Button variant="ghost" size="icon" onClick={playNext}><SkipForward className="h-6 w-6" /></Button>
                        <Button variant="ghost" size="icon" onClick={toggleRepeat}>{repeatMode === 'one' ? <Repeat1 className="h-5 w-5 text-primary" /> : <Repeat className={cn("h-5 w-5", repeatMode === 'all' && "text-primary")} />}</Button>
                    </div>
                    <div className="w-full flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatDuration(currentTime)}</span>
                        <Slider value={[currentTime]} max={duration} step={1} onValueChange={(value) => seek(value[0])} />
                        <span className="text-xs text-muted-foreground">{formatDuration(duration)}</span>
                    </div>
                </div>
                {/* Kontrol Volume */}
                <div className="flex items-center justify-end gap-2">
                    {volume === 0 ? <VolumeX /> : volume < 0.5 ? <Volume1 /> : <Volume2 />}
                    <Slider className="w-[100px]" value={[volume]} max={1} step={0.01} onValueChange={(value) => setVolume(value[0])} />
                </div>
            </div>

            {/* --- Tampilan Mobile (di bawah md) --- */}
            <div className="container mx-auto md:hidden flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0" onClick={onBarClick}>
                    <img src={nowPlaying.albumArtUrl} alt={nowPlaying.title} className="w-12 h-12 rounded-md" />
                    <div className="min-w-0">
                        <p className="font-bold truncate text-sm">{nowPlaying.artist_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{nowPlaying.title}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={togglePlayPause} className="h-12 w-12">
                    {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                </Button>
            </div>
        </footer>
    );
};

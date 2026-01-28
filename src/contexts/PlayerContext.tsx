// src/contexts/PlayerContext.tsx
import { createContext, useState, useRef, useEffect, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

// --- Tipe Data ---
export interface Track {
    id: string;
    title: string;
    artist_name: string;
    audio_url: string;
    explicit_lyrics: boolean;
    duration: number | null;
    albumArtUrl: string; // Menambahkan ini agar setiap lagu tahu covernya
}

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerContextType {
    isPlaying: boolean;
    nowPlaying: Track | null;
    playlist: Track[];
    play: (tracks: Track[], startIndex?: number) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrev: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    volume: number;
    duration: number;
    currentTime: number;
    repeatMode: RepeatMode;
    toggleRepeat: () => void;
    isShuffle: boolean;
    toggleShuffle: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [playlist, setPlaylist] = useState<Track[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
    const [isShuffle, setIsShuffle] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(new Audio());
    const currentBlobUrl = useRef<string | null>(null);

    // Fungsi utama untuk memulai pemutaran
    const play = (tracks: Track[], startIndex = 0) => {
        setPlaylist(tracks);
        setCurrentTrackIndex(startIndex);
    };

    // Efek untuk memuat dan memutar lagu saat currentTrackIndex berubah
    useEffect(() => {
        if (currentTrackIndex === null || !playlist[currentTrackIndex]) {
            setNowPlaying(null);
            return;
        }

        const track = playlist[currentTrackIndex];
        setNowPlaying(track);
        
        const loadAndPlayAudio = async () => {
            if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
            setIsPlaying(false);
            
            try {
                const response = await fetch(track.audio_url);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                currentBlobUrl.current = blobUrl;
                audioRef.current.src = blobUrl;
                audioRef.current.play();
            } catch (err) {
                toast.error(`Gagal memuat: ${track.title}`);
                console.error(err);
            }
        };

        loadAndPlayAudio();
    }, [currentTrackIndex, playlist]);

    // Fungsi untuk maju ke lagu berikutnya
    const playNext = () => {
        if (playlist.length === 0 || currentTrackIndex === null) return;
        
        if (repeatMode === 'one') {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }

        if (isShuffle) {
            const nextIndex = Math.floor(Math.random() * playlist.length);
            setCurrentTrackIndex(nextIndex);
            return;
        }
        
        const nextIndex = currentTrackIndex + 1;
        if (nextIndex < playlist.length) {
            setCurrentTrackIndex(nextIndex);
        } else if (repeatMode === 'all') {
            setCurrentTrackIndex(0); // Kembali ke awal
        } else {
            setIsPlaying(false); // Playlist selesai
        }
    };

    // Fungsi untuk kembali ke lagu sebelumnya
    const playPrev = () => {
        if (playlist.length === 0 || currentTrackIndex === null) return;
        
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0; // Ulangi lagu saat ini jika sudah berjalan > 3 detik
            return;
        }

        const prevIndex = currentTrackIndex - 1;
        if (prevIndex >= 0) {
            setCurrentTrackIndex(prevIndex);
        } else {
            setCurrentTrackIndex(playlist.length - 1); // Kembali ke akhir playlist
        }
    };
    
    // --- Kontrol Pemutar Dasar ---
    const togglePlayPause = () => {
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
    };

    const seek = (time: number) => {
        audioRef.current.currentTime = time;
    };
    
    const handleSetVolume = (vol: number) => {
        setVolume(vol);
        audioRef.current.volume = vol;
    };

    const toggleRepeat = () => {
        const modes: RepeatMode[] = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(repeatMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setRepeatMode(modes[nextIndex]);
    };
    
    const toggleShuffle = () => setIsShuffle(prev => !prev);


    // Efek untuk menghubungkan event dari elemen audio ke state React
    useEffect(() => {
        const audio = audioRef.current;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onLoadedMetadata = () => setDuration(audio.duration);
        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onEnded = () => playNext();

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, [playNext]);

    const value = {
        isPlaying,
        nowPlaying,
        playlist,
        play,
        togglePlayPause,
        playNext,
        playPrev,
        seek,
        setVolume: handleSetVolume,
        volume,
        duration,
        currentTime,
        repeatMode,
        toggleRepeat,
        isShuffle,
        toggleShuffle
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};

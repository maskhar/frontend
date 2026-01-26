// supabase/functions/get-catalog-tracks/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';

// Definisikan CORS headers untuk memperbolehkan akses dari domain manapun.
// Untuk produksi, sebaiknya ganti '*' dengan domain frontend Anda.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tipe data untuk relasi, agar lebih aman
interface Artist {
  id: string;
  name: string;
}

interface Album {
  id: string;
  title: string;
  cover_art_url: string;
  release_year: number;
  artists: Artist | Artist[]; // Bisa jadi objek atau array
}

interface Track {
  id: string;
  title: string;
  duration_seconds: number;
  gcs_audio_url: string;
  albums: Album | null;
  artists: Artist[] | null;
}


Deno.serve(async (req) => {
  // Handle preflight request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Hanya izinkan method GET
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabaseBUrl = Deno.env.get('SUPABASE_B_URL');
    const supabaseBAnonKey = Deno.env.get('SUPABASE_B_ANON_KEY');

    if (!supabaseBUrl || !supabaseBAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase B credentials not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseB = createClient(supabaseBUrl, supabaseBAnonKey);

    const { data: tracks, error: tracksError } = await supabaseB
      .from('tracks')
      .select(
        `
        id,
        title,
        duration_seconds,
        gcs_audio_url,
        albums ( id, title, cover_art_url, release_year, artists ( id, name ) ),
        artists ( id, name )
      `
      )
      .eq('is_public', true) as { data: Track[], error: any };

    if (tracksError) {
      console.error('Error fetching tracks from Supabase B:', tracksError);
      return new Response(
        JSON.stringify({ error: tracksError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tracks) {
      return new Response(
        JSON.stringify([]), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Fungsi bantuan untuk mendapatkan nama artis
    const getArtistName = (track: Track): string => {
      // Prioritas 1: Artis yang berelasi langsung dengan track
      if (track.artists && track.artists.length > 0) {
        return track.artists.map(a => a.name).join(', ');
      }
      // Prioritas 2: Artis dari album jika ada
      if (track.albums && track.albums.artists) {
        const albumArtists = Array.isArray(track.albums.artists) ? track.albums.artists : [track.albums.artists];
        if (albumArtists.length > 0) {
          return albumArtists.map(a => a.name).join(', ');
        }
      }
      return 'Unknown Artist';
    };

    const formattedTracks = tracks.map((track) => ({
      id: track.id,
      title: track.title,
      artist: getArtistName(track),
      album: track.albums ? track.albums.title : 'Single',
      albumArtUrl: track.albums ? track.albums.cover_art_url : '/placeholder.svg',
      audioSrc: track.gcs_audio_url,
      duration: track.duration_seconds,
    }));

    return new Response(JSON.stringify(formattedTracks), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Unhandled error in Edge Function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

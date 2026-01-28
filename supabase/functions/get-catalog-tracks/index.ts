// supabase/functions/get-catalog-tracks/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handleOptions(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

Deno.serve(async (req) => {
  const optionsResponse = await handleOptions(req);
  if (optionsResponse) return optionsResponse;

  try {
    const supabaseUrl = Deno.env.get("PROJECT_B_URL");
    const serviceRoleKey = Deno.env.get("PROJECT_B_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase URL or Service Role Key");
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    const body = await req.json().catch(() => ({}));
    const { limit = 200, offset = 0, releaseId } = body;

    let data;
    let error;
    let count = null;

    const query = `
      id,
      title,
      artist_name,
      cover_url,
      genre,
      release_type,
      release_date,
      upc,
      tracks (
        id,
        title,
        artist_name,
        isrc,
        genre,
        audio_url,
        explicit_lyrics,
        duration
      )
    `;

    if (releaseId) {
      // --- Ambil SATU rilisan berdasarkan ID ---
      const { data: singleData, error: singleError } = await supabaseAdmin
        .from("releases")
        .select(query)
        .eq("id", releaseId)
        .eq("status", "active")
        .is("archived_at", null)
        .single(); // .single() untuk mendapatkan satu objek, bukan array
      
      data = singleData;
      error = singleError;

    } else {
      // --- Ambil DAFTAR rilisan untuk halaman grid ---
      const { data: listData, error: listError } = await supabaseAdmin
        .from("releases")
        .select(query)
        .eq("status", "active")
        .is("archived_at", null)
        .order("release_date", { ascending: false })
        .range(offset, offset + limit - 1);
      
      data = listData;
      error = listError;

      // Hanya hitung total jika kita mengambil daftar
      const { count: totalCount, error: countError } = await supabaseAdmin
        .from("releases")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .is("archived_at", null);
      
      if (countError) throw countError;
      count = totalCount;
    }

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        pagination: releaseId ? null : { // Jangan sertakan paginasi jika mengambil satu
          total: count,
          limit,
          offset,
          hasMore: count ? offset + limit < count : false,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in get-catalog-tracks function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
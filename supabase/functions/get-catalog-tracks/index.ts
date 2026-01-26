// supabase/functions/get-catalog-tracks/index.ts
// !! KODE DIAGNOSTIK SEMENTARA !!

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
  if (optionsResponse) {
    return optionsResponse;
  }

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
    
    // --- QUERY DIAGNOSTIK ---
    // Kita hanya mengambil 10 rilisan aktif tanpa lagu untuk mengisolasi masalah.
    const { data: diagnosticData, error: diagnosticError } = await supabaseAdmin
      .from("releases")
      .select(`
        id,
        title,
        status,
        artist_name
      `)
      .eq("status", "active")
      .limit(10);

    if (diagnosticError) {
      throw diagnosticError;
    }

    // Kirim respons mentah dari query diagnostik
    return new Response(
      JSON.stringify({
        success: true,
        // Kita sengaja mengirim data mentah ini untuk diinspeksi di frontend
        diagnosticData: diagnosticData, 
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

// ============================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================
const SUPABASE_URL = "https://ymwrcoghjogyyebbbyhy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd3Jjb2doam9neXllYmJieWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTQ0NzYsImV4cCI6MjA5ODQ5MDQ3Nn0.6DGYNKc4bqzDHTsJZEfivXQOgVmua2bhoCs2Ny15BWI";

let supabaseClient = null;

function getSupabaseClient() {
    if (!supabaseClient) {
        supabaseClient = supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            }
        );
    }
    return supabaseClient;
}

// Export for modules (or use globally)
window.getSupabaseClient = getSupabaseClient;
window.supabase = getSupabaseClient;

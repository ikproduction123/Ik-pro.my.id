const SUPABASE_URL = "https://gqkgvpouvygjwfiwuyvc.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxa2d2cG91dnlnandmaXd1eXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDM3NDksImV4cCI6MjA5Nzk3OTc0OX0.Y-lwoCDb2paT8skcduOWdz_60z3WLED8hWdkeWh_1_I";

const supabaseClient =
supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
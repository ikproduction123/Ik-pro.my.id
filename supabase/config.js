// supabase/config.js

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://ojzqqqzjajnualdetxtr.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qenFxcXpqYWpudWFsZGV0eHRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjg2OTMsImV4cCI6MjA5NzgwNDY5M30.YcAs_v1rEfRE5WYT83PDZzJQClZIZEgo6y8PtcjSUAE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = "https://uetucmbqqzufuosfufej.supabase.co";

// Pega aquí tu Publishable key
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_J__N-sZgyYjsuT7f_LxMeA_DPx5pKza";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

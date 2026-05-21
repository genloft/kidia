import type { APIRoute } from "astro";
import { createSupabaseClient } from "../../lib/supabase";
import type { EmailOtpType } from "@supabase/supabase-js";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url);
  
  // Para confirmación por email (Magick Links, Confirmación de cuenta)
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  
  // Para OAuth (Login con Google)
  const code = url.searchParams.get("code");
  
  const next = url.searchParams.get("next") || "/dashboard";

  const supabase = createSupabaseClient(cookies);

  // 1. Manejar confirmación por Email
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    
    if (!error) {
      return redirect(next);
    }
    console.error("Error validando token_hash:", error.message);
  }

  // 2. Manejar código OAuth (Google)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return redirect(next);
    }
    console.error("Error intercambiando code:", error.message);
  }

  // Si falla, volvemos a login
  return redirect("/login?error=auth-callback-failed");
};

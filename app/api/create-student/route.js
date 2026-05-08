import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Client admin — utilise la clé SERVICE_ROLE (secrète, côté serveur uniquement)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ← à ajouter dans .env.local et Vercel
);

export async function POST(request) {
  try {
    const { email, password, username, plan } = await request.json();

    // Validation basique
    if (!email || !password || !username || !plan) {
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });
    }

    // 1. Créer l'utilisateur sans email de confirmation
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { username },
      email_confirm: true,   // ← compte actif immédiatement
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Mettre à jour le profil avec le plan et valider l'accès
    const assistanceEnd =
      plan !== "Silver"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: data.user.id,
      username,
      plan,
      is_validated: true,
      is_admin: false,
      ...(assistanceEnd && { assistance_end_date: assistanceEnd }),
    });

    if (profileError) {
      // Le compte auth est créé mais le profil a échoué — on log mais on continue
      console.error("Erreur profil:", profileError.message);
    }

    return NextResponse.json({ success: true, userId: data.user.id });

  } catch (err) {
    console.error("Erreur serveur:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue." }, { status: 500 });
  }
}

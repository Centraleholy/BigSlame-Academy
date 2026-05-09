import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { email, password, username, plan } = await request.json();
    if (!email || !password || !username || !plan)
      return NextResponse.json({ error: "Tous les champs sont obligatoires." }, { status: 400 });

    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password,
      user_metadata: { username },
      email_confirm: true,
    });
    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 });

    const assistanceEnd = plan !== "Silver"
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    await supabaseAdmin.from("profiles").upsert({
      id: data.user.id, username, plan,
      is_validated: true, is_admin: false,
      ...(assistanceEnd && { assistance_end_date: assistanceEnd }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

-- ============================================
-- BIGSLAME ACADEMY — SUPABASE DATABASE SCHEMA
-- ============================================
-- Exécute ce SQL dans l'éditeur SQL de Supabase
-- https://supabase.com → SQL Editor

-- ============================================================
-- 1. TABLE : profiles (complète auth.users de Supabase)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  plan text check (plan in ('Silver', 'Gold', 'Platinum')) default 'Silver',
  is_admin boolean default false,
  is_validated boolean default false,
  assistance_end_date timestamptz,
  avatar_url text,
  created_at timestamptz default now()
);

-- Active Row Level Security
alter table public.profiles enable row level security;

-- Policies
create policy "Un utilisateur peut lire son propre profil"
  on profiles for select using (auth.uid() = id);

create policy "Un utilisateur peut modifier son propre profil"
  on profiles for update using (auth.uid() = id);

create policy "Admin peut tout lire"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admin peut tout modifier"
  on profiles for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Trigger : crée un profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. TABLE : messages (chat privé élève ↔ admin)
-- ============================================================
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

-- Un élève ne voit que SES messages
create policy "Voir ses propres messages"
  on messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "Envoyer un message"
  on messages for insert with check (auth.uid() = sender_id);

-- Activer Realtime pour le chat en temps réel
alter publication supabase_realtime add table messages;


-- ============================================================
-- 3. TABLE : beats (prods de BigSlame sur la page d'accueil)
-- ============================================================
create table public.beats (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  bpm integer,
  style text check (style in ('Drill', 'Trap', 'Afrobeat', 'Autre')),
  audio_url text not null,
  cover_url text,
  plays integer default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

alter table public.beats enable row level security;

-- Tout le monde peut lire les beats publiés
create policy "Lire les beats publiés"
  on beats for select using (is_published = true);

-- Seul l'admin peut écrire
create policy "Admin gère les beats"
  on beats for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );


-- ============================================================
-- 4. TABLE : resources (liens de téléchargement par plan)
-- ============================================================
create table public.resources (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text check (type in ('pdf', 'zip', 'video', 'link')),
  url text not null,
  plan text check (plan in ('Silver', 'Gold', 'Platinum', 'All')),
  icon text default '📄',
  created_at timestamptz default now()
);

alter table public.resources enable row level security;

-- Un élève validé ne voit que les ressources de son plan
create policy "Accès ressources selon plan"
  on resources for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.is_validated = true
        and (
          resources.plan = 'All'
          or resources.plan = p.plan
          or (p.plan = 'Platinum')
          or (p.plan = 'Gold' and resources.plan in ('Silver', 'Gold'))
        )
    )
  );


-- ============================================================
-- 5. TABLE : student_beats (beats envoyés par élèves)
-- ============================================================
create table public.student_beats (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  file_url text not null,
  file_name text,
  status text check (status in ('pending', 'reviewed', 'corrected')) default 'pending',
  admin_comment text,
  submitted_at timestamptz default now()
);

alter table public.student_beats enable row level security;

-- Un élève voit ses propres soumissions
create policy "Voir ses soumissions"
  on student_beats for select using (auth.uid() = student_id);

create policy "Soumettre un beat"
  on student_beats for insert with check (
    auth.uid() = student_id
    and exists (
      select 1 from profiles
      where id = auth.uid()
        and plan in ('Gold', 'Platinum')
        and is_validated = true
    )
  );

-- Admin voit tout
create policy "Admin voit toutes les soumissions"
  on student_beats for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );


-- ============================================================
-- 6. TABLE : top5 (classement hebdomadaire)
-- ============================================================
create table public.top5 (
  id serial primary key,
  rank integer unique check (rank between 1 and 5),
  student_name text not null,
  style text,
  beats_count integer default 0,
  updated_at timestamptz default now()
);

alter table public.top5 enable row level security;

create policy "Tout le monde peut lire le top 5"
  on top5 for select using (true);

create policy "Seul l'admin peut modifier"
  on top5 for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Données initiales top 5
insert into public.top5 (rank, student_name, style, beats_count) values
  (1, 'DrumKing_CI', 'Afrobeat', 28),
  (2, 'LilBeatz_237', 'Drill', 12),
  (3, 'AfroVibes_Abidjan', 'Trap', 9),
  (4, 'TrapSoul_Dakar', 'Drill', 5),
  (5, 'SoundWave_Lagos', 'Afrobeat', 3);


-- ============================================================
-- STORAGE BUCKETS (à créer dans Supabase Dashboard > Storage)
-- ============================================================
-- 1. "beats" → Beats de BigSlame (public)
-- 2. "student-beats" → Fichiers envoyés par élèves (private)
-- 3. "resources" → Ressources de formation (private)
-- 4. "avatars" → Photos de profil (public)

# 🎹 BigSlame Academy — Guide d'installation complet

## Stack Technique
- **Frontend** : Next.js 14 (App Router) + Tailwind CSS
- **Backend** : Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Déploiement** : Vercel (gratuit)

---

## 1. Installation locale

```bash
# Créer le projet Next.js
npx create-next-app@latest bigslame-academy
cd bigslame-academy

# Choisir : TypeScript=No, ESLint=Yes, Tailwind=Yes, App Router=Yes

# Installer les dépendances
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install lucide-react
```

---

## 2. Structure des fichiers

```
bigslame-academy/
├── app/
│   ├── layout.js              ← Layout global + Navbar
│   ├── page.js                ← Page d'accueil (Hero + Beats + Offres + Top5)
│   ├── dashboard/
│   │   └── page.js            ← Espace élève (ressources, upload, chat)
│   ├── admin/
│   │   └── page.js            ← Dashboard admin
│   └── auth/
│       ├── login/page.js      ← Page de connexion
│       └── callback/route.js  ← Callback OAuth Supabase
│
├── components/
│   ├── Navbar.jsx
│   ├── AudioPlayer.jsx
│   ├── PricingCards.jsx
│   ├── Top5.jsx
│   ├── ChatBox.jsx
│   ├── FileUpload.jsx
│   └── AdminStudentList.jsx
│
├── lib/
│   └── supabase.js            ← Client Supabase
│
├── .env.local                 ← Variables d'environnement
└── schema.sql                 ← À coller dans Supabase SQL Editor
```

---

## 3. Configuration Supabase

### a) Créer un projet Supabase
1. Va sur https://supabase.com → New project
2. Note ton **Project URL** et ta **Anon Key**

### b) Exécuter le schéma SQL
1. Supabase Dashboard → SQL Editor
2. Colle tout le contenu de `schema.sql`
3. Clique "Run"

### c) Configurer le Storage
Dans Supabase Dashboard → Storage → Create Bucket :
- `beats` (Public) — pour les prods de BigSlame
- `student-beats` (Private) — pour les fichiers des élèves
- `resources` (Private) — pour les ressources de formation

---

## 4. Variables d'environnement (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Clé secrète admin uniquement
```

---

## 5. Code source clé

### lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

### Inscription d'un élève (après paiement Mobile Money)
```javascript
// Tu crées toi-même les comptes depuis l'admin
const { data, error } = await supabase.auth.admin.createUser({
  email: 'eleve@email.com',
  password: 'motdepasse_temporaire',
  user_metadata: { username: 'LilBeatz_237' }
})

// Puis tu valides son accès
await supabase
  .from('profiles')
  .update({
    plan: 'Gold',
    is_validated: true,
    assistance_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 jours
  })
  .eq('id', data.user.id)
```

### Chat Realtime (composant ChatBox)
```javascript
// Abonnement temps réel aux nouveaux messages
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `receiver_id=eq.${userId}`
    }, (payload) => {
      setMessages(prev => [...prev, payload.new])
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [userId])

// Envoyer un message
const sendMessage = async (content) => {
  await supabase.from('messages').insert({
    sender_id: currentUser.id,
    receiver_id: adminId,
    content
  })
}
```

### Upload de beat (élève → correction)
```javascript
const uploadBeat = async (file) => {
  // 1. Upload dans Supabase Storage
  const { data } = await supabase.storage
    .from('student-beats')
    .upload(`${userId}/${Date.now()}_${file.name}`, file)

  // 2. Enregistrer en base
  await supabase.from('student_beats').insert({
    student_id: userId,
    file_url: data.path,
    file_name: file.name
  })
}
```

### Lecture des beats (admin poster, public écouter)
```javascript
// Récupérer les beats publiés
const { data: beats } = await supabase
  .from('beats')
  .select('*')
  .eq('is_published', true)
  .order('created_at', { ascending: false })

// Incrémenter les plays
await supabase.rpc('increment_plays', { beat_id: id })
```

---

## 6. Déploiement sur Vercel (gratuit)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod

# Ajouter les variables d'environnement dans Vercel Dashboard
# Settings → Environment Variables
```

---

## 7. Flux d'inscription (Manuel — Mobile Money)

```
1. L'élève voit les offres sur le site
2. Il clique "S'inscrire" → ouvre WhatsApp avec message pré-rempli
3. Vous discutez sur WhatsApp/Telegram
4. L'élève paie par Mobile Money (Airtel, Orange, etc.)
5. Tu confirmes le paiement
6. Tu vas dans ton Admin Dashboard
7. Tu crées le compte élève (email + pass temporaire)
8. Tu coches "Validé" → l'élève reçoit ses identifiants
9. L'élève se connecte et accède à ses ressources
```

---

## 8. Sécurité

- Toutes les tables ont Row Level Security (RLS) activé
- Les ressources sont protégées par plan (Silver/Gold/Platinum)
- Seul l'admin peut valider les inscriptions
- Les fichiers audio des élèves sont privés (Storage Private Bucket)
- L'assistance est limitée dans le temps (assistance_end_date)

---

## 9. Commandes utiles

```bash
npm run dev      # Lancer en local (http://localhost:3000)
npm run build    # Build de production
npm run start    # Lancer en production
```

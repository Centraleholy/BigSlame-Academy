"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const GOLD    = "#F5A623", DARK = "#0A0A0A", SURFACE = "#141414", SURF2 = "#1E1E1E", BORDER = "#2A2A2A";
const ADMIN_ID = "d94ea2f0-abc0-4675-a491-8b990f1afc17"; // ← ton vrai ID admin Supabase

// ── RESSOURCES PAR PLAN ───────────────────────────────────────────────────────
const RESOURCES = {
  Silver:   [{ name:"FL Studio - Guide Complet (PDF)", type:"pdf", icon:"📄" },{ name:"Drum Kit Drill - BigSlame Pack", type:"zip", icon:"🥁" },{ name:"Vidéo : Patterns Drill", type:"video", icon:"🎥" }],
  Gold:     [{ name:"FL Studio - Guide Complet (PDF)", type:"pdf", icon:"📄" },{ name:"Drum Kit Drill + Trap + Afrobeat", type:"zip", icon:"🥁" },{ name:"3 Vidéos tutoriels", type:"video", icon:"🎥" },{ name:"MIDI Pack - 50 progressions", type:"zip", icon:"🎹" }],
  Platinum: [{ name:"ALL Drum Kits (8 styles)", type:"zip", icon:"🥁" },{ name:"VST Nexus 2", type:"link", icon:"🔗" },{ name:"VST Serum", type:"link", icon:"🔗" },{ name:"VST Omnisphere", type:"link", icon:"🔗" },{ name:"Vidéos 8 styles", type:"video", icon:"🎥" },{ name:"Masterclass BigSlame", type:"video", icon:"🎥" }],
};

const genPassword = () => {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({length:12},()=>c[Math.floor(Math.random()*c.length)]).join("");
};

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:${DARK};color:#fff;font-family:'Space Grotesk',sans-serif;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:${SURFACE}}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}
  .bebas{font-family:'Bebas Neue',cursive}
  .btn-gold{background:${GOLD};color:#000;border:none;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:700;transition:all .2s}
  .btn-gold:hover{opacity:.9;transform:translateY(-1px)}.btn-gold:active{transform:scale(.97)}
  .btn-outline{background:transparent;border:1px solid ${BORDER};color:#fff;cursor:pointer;font-family:'Space Grotesk',sans-serif;transition:all .2s}
  .btn-outline:hover{border-color:${GOLD};color:${GOLD}}.btn-outline:active{transform:scale(.97)}
  .btn-red{background:#ef4444;color:#fff;border:none;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:600;transition:all .2s}
  .btn-red:hover{opacity:.85}
  .card{background:${SURFACE};border:1px solid ${BORDER};border-radius:12px}
  .card2{background:${SURF2};border:1px solid ${BORDER};border-radius:8px}
  .input{background:${SURF2};border:1px solid ${BORDER};color:#fff;border-radius:6px;padding:10px 14px;width:100%;font-family:'Space Grotesk',sans-serif;font-size:14px;outline:none}
  .input:focus{border-color:${GOLD}}
  select.input option{background:${SURF2}}
  .badge{display:inline-block;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:600}
  .badge-gold{background:#F5A62322;color:${GOLD}}.badge-silver{background:#C0C0C022;color:#C0C0C0}
  .badge-platinum{background:#E5E4E222;color:#E5E4E2}.badge-green{background:#22c55e22;color:#22c55e}
  .badge-orange{background:#f9731622;color:#f97316}
  .progress-bar{background:${BORDER};border-radius:99px;height:4px}
  .progress-fill{background:${GOLD};border-radius:99px;height:4px;transition:width .6s ease}
  .msg-bubble{max-width:78%;padding:10px 14px;border-radius:12px;font-size:14px;line-height:1.5}
  .msg-admin{background:${GOLD};color:#000;border-radius:12px 12px 4px 12px}
  .msg-user{background:${SURF2};color:#fff;border-radius:12px 12px 12px 4px}
  .waveform-bar{background:${GOLD};border-radius:2px;animation:pulse 1.2s ease-in-out infinite}
  .upload-zone{border:2px dashed ${BORDER};border-radius:12px;text-align:center;cursor:pointer;transition:all .2s}
  .upload-zone:hover,.upload-zone.active{border-color:${GOLD};background:#F5A62308}
  .plan-card{position:relative;border-radius:16px;transition:transform .2s}
  .plan-card:hover{transform:translateY(-4px)}
  .plan-card.featured{border:2px solid ${GOLD} !important}
  .rank-num{font-family:'Bebas Neue',cursive;font-size:46px;color:${BORDER};line-height:1}
  .rank-num.top{color:${GOLD}}
  .tab-btn{background:transparent;border:none;color:#888;cursor:pointer;font-family:'Space Grotesk',sans-serif;font-weight:500;border-radius:6px;transition:all .2s;white-space:nowrap}
  .tab-btn.active{background:${SURF2};color:#fff}
  .tab-btn:hover:not(.active){color:#ccc}
  .empty-state{text-align:center;padding:48px 24px;color:#555}
  .empty-state span{font-size:38px;display:block;margin-bottom:10px}
  .copy-box{background:#0D1117;border:1px solid #30363D;border-radius:8px;padding:14px 16px;font-family:monospace;font-size:13px;color:#58A6FF;user-select:all;word-break:break-all;cursor:pointer;transition:background .2s}
  .copy-box:hover{background:#161B22}
  .notif-dot{position:absolute;top:-4px;right:-4px;width:10px;height:10px;background:#ef4444;border-radius:50%;border:2px solid ${DARK}}
  @keyframes pulse{0%,100%{opacity:.4;transform:scaleY(.6)}50%{opacity:1;transform:scaleY(1)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
  .fade-in{animation:fadeIn .4s ease forwards}
  .slide-down{animation:slideDown .25s ease forwards}
  .blink{animation:blink 1.5s ease infinite}
  .nav{position:sticky;top:0;z-index:100;background:rgba(10,10,10,.97);backdrop-filter:blur(12px);border-bottom:1px solid ${BORDER}}
  .nav-inner{max-width:1200px;margin:0 auto;padding:0 20px;height:62px;display:flex;align-items:center;justify-content:space-between}
  .nav-logo{background:none;border:none;cursor:pointer}
  .nav-desk{display:flex;gap:8px;align-items:center}
  .nav-burger{display:none;background:none;border:1px solid ${BORDER};color:#fff;width:40px;height:40px;border-radius:8px;cursor:pointer;font-size:18px;align-items:center;justify-content:center}
  .mob-menu{display:none;padding:14px 20px;border-bottom:1px solid ${BORDER};background:rgba(10,10,10,.99)}
  .mob-inner{display:flex;flex-direction:column;gap:10px}
  .notif{position:fixed;top:70px;right:20px;z-index:999;background:#22c55e;color:#000;padding:11px 18px;border-radius:8px;font-weight:600;font-size:13px;animation:fadeIn .3s ease;max-width:340px}
  .notif.error{background:#ef4444;color:#fff}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:500;padding:16px}
  .modal{width:100%;max-width:440px;padding:32px}
  .hero-sec{min-height:88vh;display:flex;align-items:center;padding:60px 20px;max-width:1200px;margin:0 auto}
  .hero-grid{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;width:100%}
  .hero-h1{font-size:clamp(58px,10vw,118px);line-height:.92;letter-spacing:-2px}
  .hero-btns{display:flex;gap:12px;margin-top:26px;flex-wrap:wrap}
  .off-sec{padding:72px 20px;background:${SURFACE}}
  .off-inner{max-width:1200px;margin:0 auto}
  .plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .t5-sec{padding:72px 20px}
  .t5-inner{max-width:780px;margin:0 auto}
  .dash-wrap{max-width:900px;margin:0 auto;padding:36px 20px}
  .dash-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}
  .adm-wrap{max-width:1100px;margin:0 auto;padding:36px 20px}
  .adm-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:16px}
  .stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .tabs-row{display:flex;gap:6px;margin-bottom:24px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}
  .tabs-row::-webkit-scrollbar{height:0}
  .chat-grid{display:grid;grid-template-columns:220px 1fr;gap:16px}
  .footer{border-top:1px solid ${BORDER};padding:30px 20px;text-align:center}
  @media(max-width:900px){.plans-grid{grid-template-columns:1fr;max-width:420px;margin:0 auto}.chat-grid{grid-template-columns:1fr}.chat-side{display:none!important}}
  @media(max-width:640px){
    .nav-desk{display:none}.nav-burger{display:flex}.mob-menu{display:block}
    .notif{right:12px;left:12px;top:68px;text-align:center}
    .hero-sec{padding:36px 16px 50px;min-height:auto}.hero-grid{grid-template-columns:1fr;gap:30px}
    .hero-h1{font-size:clamp(50px,18vw,78px)}.hero-btns{flex-direction:column}
    .hero-btns button{width:100%;padding:14px!important;font-size:15px!important}
    .off-sec{padding:48px 16px}.off-inner h2{font-size:40px!important}
    .t5-sec{padding:48px 16px}.rank-num{font-size:34px}
    .dash-wrap{padding:20px 14px}.dash-head{flex-direction:column;align-items:flex-start}
    .adm-wrap{padding:20px 14px}.adm-head{flex-direction:column}.stats-row{gap:6px}
    .tab-btn{font-size:12px!important;padding:7px 10px!important}
    .upload-zone{padding:24px 14px!important}.modal{padding:24px 18px}
    .msg-bubble{max-width:88%;font-size:13px}.tbl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
    table{min-width:500px}.footer{padding:24px 14px 36px}
  }
  @media(max-width:380px){.hero-h1{font-size:46px}.stats-row{grid-template-columns:1fr}.plan-card{padding:20px 14px!important}}
`;

const Empty = ({ icon, text }) => <div className="empty-state"><span>{icon}</span><p>{text}</p></div>;

// ══════════════════════════════════════════════════════════════════════════════
export default function BigSlameAcademy() {

  const [page, setPage]       = useState("home");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const [showLogin, setShowLogin]         = useState(false);
  const [loginForm, setLoginForm]         = useState({ email:"", password:"" });
  const [loginError, setLoginError]       = useState("");
  const [loginBusy, setLoginBusy]         = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCode, setAdminCode]         = useState("");
  const [adminCodeErr, setAdminCodeErr]   = useState("");
  const [showRegister, setShowRegister]   = useState(null);
  const [burgerOpen, setBurgerOpen]       = useState(false);
  const [notif, setNotif]                 = useState({ msg:"", type:"ok" });

  // Données
  const [beats, setBeats]       = useState([]);
  const [top5, setTop5]         = useState([]);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [myBeats, setMyBeats]   = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // badge messages non lus (admin)

  // UI
  const [adminTab, setAdminTab] = useState("students");
  const [studTab, setStudTab]   = useState("resources");
  const [chatWith, setChatWith] = useState(null);

  // Chat
  const [chatMsg, setChatMsg]   = useState("");
  const chatEndRef              = useRef(null);

  // Audio
  const audioRef        = useRef(null);
  const listenTimers    = useRef({});   // timers 15s par beat
  const countedBeats    = useRef(new Set()); // beats déjà comptés cette session
  const [playing, setPlaying]           = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);

  // Beat upload admin
  const beatFileRef = useRef();
  const [beatFile, setBeatFile]   = useState(null);
  const [newBeat, setNewBeat]     = useState({ title:"", bpm:"", style:"Drill" });
  const [beatBusy, setBeatBusy]   = useState(false);

  // Création compte élève
  const [newStudent, setNewStudent]     = useState({ username:"", email:"", password:genPassword(), plan:"Silver" });
  const [createBusy, setCreateBusy]     = useState(false);
  const [createdCreds, setCreatedCreds] = useState(null);

  // Top 5
  const [top5Edit, setTop5Edit] = useState([]);

  // Upload élève
  const studentFileRef = useRef();
  const [studentFile, setStudentFile]   = useState(null);
  const [uploadBusy, setUploadBusy]     = useState(false);

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  const notify = (msg, type="ok") => { setNotif({ msg, type }); setTimeout(() => setNotif({ msg:"", type:"ok" }), 4000); };
  const go = (p) => { setPage(p); setBurgerOpen(false); window.scrollTo(0,0); };

  // ── AUTH ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => {
      setSession(session);
      session ? fetchProfile(session.user.id) : setAppLoading(false);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setIsAdmin(false); setAppLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    setProfile(data);
    if (data?.is_admin) { setIsAdmin(true); go("admin"); await fetchAdminData(); }
    else go("dashboard");
    setAppLoading(false);
  };

  // ── DONNÉES PUBLIQUES ─────────────────────────────────────────────────────────
  useEffect(() => { fetchPublicData(); }, []);

  const fetchPublicData = async () => {
    const [{ data:b }, { data:t }] = await Promise.all([
      supabase.from("beats").select("*").eq("is_published", true).order("created_at", { ascending:false }),
      supabase.from("top5").select("*").order("rank"),
    ]);
    setBeats(b || []);
    const t5 = t || [];
    setTop5(t5);
    setTop5Edit(t5.map(s => ({ ...s })));
  };

  // ── DONNÉES ÉLÈVE ─────────────────────────────────────────────────────────────
  const fetchStudentData = async () => {
    if (!session) return;
    const uid = session.user.id;
    // ✅ FIX: filtre précis — les messages entre cet élève et l'admin
    const [{ data:msgs }, { data:mb }] = await Promise.all([
      supabase.from("messages").select("*")
        .or(
          `and(sender_id.eq.${uid},receiver_id.eq.${ADMIN_ID}),and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${uid})`
        )
        .order("created_at"),
      supabase.from("student_beats").select("*").eq("student_id", uid).order("submitted_at", { ascending:false }),
    ]);
    setMessages(msgs || []);
    setMyBeats(mb || []);
  };

  // ── DONNÉES ADMIN ─────────────────────────────────────────────────────────────
  const fetchAdminData = async () => {
    // ✅ FIX: exclut explicitement is_admin=true pour éviter comptage à zéro
    const { data } = await supabase.from("profiles")
      .select("*")
      .eq("is_admin", false)
      .order("created_at", { ascending:false });
    setStudents(data || []);
  };

  // ✅ FIX: fetchConversation filtre précis élève ↔ admin dans les deux sens
  const fetchConversation = async (studentId) => {
    const { data } = await supabase.from("messages").select("*")
      .or(
        `and(sender_id.eq.${studentId},receiver_id.eq.${ADMIN_ID}),and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${studentId})`
      )
      .order("created_at");
    setMessages(data || []);
  };

  useEffect(() => {
    if (chatWith) fetchConversation(chatWith.id);
  }, [chatWith]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  // ── REALTIME — ÉLÈVE ──────────────────────────────────────────────────────────
  // ✅ FIX: écoute en temps réel les messages reçus par l'élève (sender = admin)
  useEffect(() => {
    if (!session || isAdmin) return;
    fetchStudentData();

    const uid = session.user.id;
    const ch = supabase.channel(`msg-eleve-${uid}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `receiver_id=eq.${uid}`,
      }, payload => {
        setMessages(m => [...m, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, [session, isAdmin]);

  // ── REALTIME — ADMIN ──────────────────────────────────────────────────────────
  // ✅ FIX: écoute les nouveaux messages reçus par l'admin + nouveaux profils
  useEffect(() => {
    if (!isAdmin) return;

    // Nouveaux messages vers l'admin
    const msgCh = supabase.channel("msg-admin-inbox")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `receiver_id=eq.${ADMIN_ID}`,
      }, payload => {
        // Si l'onglet conversation est ouvert pour cet élève → ajoute le message
        setChatWith(prev => {
          if (prev && payload.new.sender_id === prev.id) {
            setMessages(m => [...m, payload.new]);
          } else {
            // Sinon, incrémente le badge non lu
            setUnreadCount(c => c + 1);
          }
          return prev;
        });
      })
      .subscribe();

    // Nouveaux profils élèves + mises à jour (validation)
    const profCh = supabase.channel("profiles-admin-rt")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "profiles",
      }, payload => {
        if (!payload.new.is_admin) {
          setStudents(s => [payload.new, ...s]);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles",
      }, payload => {
        if (!payload.new.is_admin) {
          setStudents(s => s.map(st => st.id === payload.new.id ? payload.new : st));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgCh);
      supabase.removeChannel(profCh);
    };
  }, [isAdmin]);

  // ── AUDIO PLAYER + COMPTEUR DE PLAYS (15 secondes) ───────────────────────────
  // ✅ FIX: incrémente plays via RPC Supabase après 15 secondes d'écoute continue
  const incrementPlayCount = async (beatId) => {
    await supabase.rpc("increment_plays", { beat_id: beatId });
    setBeats(prev => prev.map(b => b.id === beatId ? { ...b, plays: (b.plays||0) + 1 } : b));
  };

  const togglePlay = (beat) => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    if (playing === beat.id) {
      audio.pause();
      // Annule le timer 15s si on pause avant
      if (listenTimers.current[beat.id]) {
        clearTimeout(listenTimers.current[beat.id]);
        delete listenTimers.current[beat.id];
      }
      setPlaying(null);
    } else {
      // Arrête le beat précédent et son timer
      audio.pause();
      if (playing && listenTimers.current[playing]) {
        clearTimeout(listenTimers.current[playing]);
        delete listenTimers.current[playing];
      }

      if (beat.audio_url) {
        audio.src = beat.audio_url;
        audio.play().catch(() => notify("Lecture impossible.", "error"));
        audio.ontimeupdate = () => setAudioProgress(audio.duration ? (audio.currentTime/audio.duration)*100 : 0);
        audio.onended = () => { setPlaying(null); setAudioProgress(0); };

        // ✅ Démarre le timer 15s — un seul comptage par beat par session
        if (!countedBeats.current.has(beat.id)) {
          listenTimers.current[beat.id] = setTimeout(() => {
            countedBeats.current.add(beat.id);
            delete listenTimers.current[beat.id];
            incrementPlayCount(beat.id);
          }, 15000);
        }
      }
      setPlaying(beat.id);
    }
  };

  // ── CONNEXION ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { setLoginError("Remplis tous les champs."); return; }
    setLoginBusy(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email:loginForm.email, password:loginForm.password });
    if (error) setLoginError("Email ou mot de passe incorrect.");
    else { setShowLogin(false); setLoginForm({ email:"", password:"" }); }
    setLoginBusy(false);
  };

  const handleLogout = async () => {
    // Nettoie les timers audio
    Object.values(listenTimers.current).forEach(clearTimeout);
    listenTimers.current = {};
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    await supabase.auth.signOut();
    setProfile(null); setIsAdmin(false); setSession(null); go("home");
  };

  const handleAdminCode = () => {
    if (adminCode === "0820") {
      setIsAdmin(true); setShowAdminCode(false); setAdminCode(""); setAdminCodeErr("");
      go("admin"); fetchAdminData(); notify("Connecté Admin 👑");
    } else { setAdminCodeErr("Code incorrect"); setAdminCode(""); }
  };

  // ── VALIDER UN ÉLÈVE ──────────────────────────────────────────────────────────
  const handleValidate = async (id) => {
    const { error } = await supabase.from("profiles").update({ is_validated:true }).eq("id", id);
    if (!error) { setStudents(s => s.map(st => st.id===id ? { ...st, is_validated:true } : st)); notify("✅ Élève validé !"); }
    else notify("Erreur : " + error.message, "error");
  };

  // ── CRÉER UN COMPTE ÉLÈVE ─────────────────────────────────────────────────────
  const handleCreateStudent = async () => {
    if (!newStudent.username.trim() || !newStudent.email.trim() || !newStudent.password.trim()) {
      notify("Remplis tous les champs.", "error"); return;
    }
    setCreateBusy(true);
    try {
      const res = await fetch("/api/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newStudent.email.trim(),
          password: newStudent.password.trim(),
          username: newStudent.username.trim(),
          plan: newStudent.plan,
        }),
      });
      const result = await res.json();
      if (!res.ok) { notify("Erreur : " + result.error, "error"); setCreateBusy(false); return; }
      setCreatedCreds({ ...newStudent });
      setNewStudent({ username:"", email:"", password:genPassword(), plan:"Silver" });
      notify("✅ Compte créé avec succès !");
      await fetchAdminData();
    } catch (e) { notify("Erreur réseau : " + e.message, "error"); }
    setCreateBusy(false);
  };

  // ── PUBLIER UN BEAT ───────────────────────────────────────────────────────────
  const handlePublishBeat = async () => {
    if (!newBeat.title.trim()) { notify("Le titre est obligatoire.", "error"); return; }
    setBeatBusy(true);
    let audioUrl = null;
    if (beatFile) {
      // ✅ FIX: nom de fichier = timestamp uniquement → pas d'espaces possibles
      const ext = beatFile.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
      const safePath = `${Date.now()}.${ext}`;
      const { error:upErr } = await supabase.storage.from("beats").upload(safePath, beatFile, { contentType:beatFile.type, upsert:false });
      if (upErr) { notify("Erreur upload : " + upErr.message, "error"); setBeatBusy(false); return; }
      const { data:{ publicUrl } } = supabase.storage.from("beats").getPublicUrl(safePath);
      audioUrl = publicUrl;
    }
    const { error } = await supabase.from("beats").insert({
      title: newBeat.title.trim(),
      bpm: newBeat.bpm ? parseInt(newBeat.bpm) : null,
      style: newBeat.style, audio_url: audioUrl, is_published: true, plays: 0,
    });
    if (error) notify("Erreur publication : " + error.message, "error");
    else {
      notify(`✅ "${newBeat.title}" publié !`);
      setNewBeat({ title:"", bpm:"", style:"Drill" }); setBeatFile(null);
      if (beatFileRef.current) beatFileRef.current.value = "";
      await fetchPublicData();
    }
    setBeatBusy(false);
  };

  const handleDeleteBeat = async (beat) => {
    if (beat.audio_url) {
      const parts = beat.audio_url.split("/object/public/beats/");
      if (parts[1]) await supabase.storage.from("beats").remove([parts[1]]);
    }
    await supabase.from("beats").delete().eq("id", beat.id);
    notify("Beat supprimé."); await fetchPublicData();
  };

  // ── ENVOYER MESSAGE ───────────────────────────────────────────────────────────
  // ✅ FIX: utilise ADMIN_ID comme receiver (élève→admin) ou sender (admin→élève)
  const sendMsg = async () => {
    if (!chatMsg.trim()) return;

    let sender_id, receiver_id;
    if (isAdmin) {
      // Admin répond à l'élève sélectionné
      if (!chatWith) { notify("Sélectionne un élève.", "error"); return; }
      sender_id  = ADMIN_ID;
      receiver_id = chatWith.id;
    } else {
      // Élève envoie à l'admin
      sender_id  = session?.user?.id;
      receiver_id = ADMIN_ID;
    }

    const { error } = await supabase.from("messages").insert({ sender_id, receiver_id, content: chatMsg.trim() });
    if (error) notify("Erreur envoi : " + error.message, "error");
    else {
      setChatMsg("");
      if (!isAdmin) fetchStudentData();
      else fetchConversation(chatWith.id);
    }
  };

  // ── UPLOAD BEAT ÉLÈVE ─────────────────────────────────────────────────────────
  const handleStudentUpload = async () => {
    if (!studentFile) { notify("Sélectionne un fichier.", "error"); return; }
    setUploadBusy(true);
    const ext = studentFile.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${session.user.id}/${Date.now()}.${ext}`;
    const { error:upErr } = await supabase.storage.from("student-beats").upload(path, studentFile, { contentType:studentFile.type });
    if (upErr) { notify("Erreur upload : " + upErr.message, "error"); setUploadBusy(false); return; }
    const { error:dbErr } = await supabase.from("student_beats").insert({ student_id:session.user.id, file_url:path, file_name:studentFile.name, status:"pending" });
    if (dbErr) notify("Erreur enregistrement.", "error");
    else { notify("🎵 Beat envoyé pour correction !"); setStudentFile(null); if(studentFileRef.current) studentFileRef.current.value=""; fetchStudentData(); }
    setUploadBusy(false);
  };

  // ── SAUVEGARDER TOP 5 ─────────────────────────────────────────────────────────
  const saveTop5 = async () => {
    const updates = top5Edit.map(s =>
      supabase.from("top5").update({ student_name:s.student_name, beats_count:s.beats_count||0, style:s.style||"" }).eq("rank", s.rank)
    );
    await Promise.all(updates);
    notify("🏆 Top 5 mis à jour !"); fetchPublicData();
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text).then(() => notify("Copié ✓"));

  // ✅ Stats admin corrigées — filtre is_admin=false garanti
  const activeStudents  = students.filter(s => !s.is_admin && s.is_validated);
  const pendingStudents = students.filter(s => !s.is_admin && !s.is_validated);
  const totalRevenue    = activeStudents.reduce((a, s) => a + (s.plan==="Silver"?21.99:s.plan==="Gold"?47.99:87.99), 0);

  // ── NAV BUTTONS ───────────────────────────────────────────────────────────────
  const NavActions = ({ mob }) => {
    const bp = mob ? { width:"100%", padding:"12px", borderRadius:8, fontSize:15 } : { padding:"8px 18px", borderRadius:6, fontSize:14 };
    if (appLoading) return null;
    if (!session && !isAdmin) return (
      <>
        <button className="btn-outline" style={bp} onClick={()=>{ setShowLogin(true); setBurgerOpen(false); }}>Connexion</button>
        <button className="btn-gold" style={bp} onClick={()=>{ go("home"); setTimeout(()=>document.getElementById("offers")?.scrollIntoView({behavior:"smooth"}),120); }}>S'inscrire</button>
      </>
    );
    if (isAdmin) return (
      <>
        <span style={{fontSize:12,color:"#888"}}>Admin</span>
        <button className="btn-gold" style={bp} onClick={()=>go("admin")}>Dashboard</button>
        <button className="btn-outline" style={bp} onClick={handleLogout}>Déconnexion</button>
      </>
    );
    return (
      <>
        {!mob && <span className={`badge badge-${(profile?.plan||"silver").toLowerCase()}`}>{profile?.plan||"Élève"}</span>}
        <button className="btn-gold" style={bp} onClick={()=>go("dashboard")}>Mon Espace</button>
        <button className="btn-outline" style={bp} onClick={handleLogout}>Déconnexion</button>
      </>
    );
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <style>{CSS}</style>
      {notif.msg && <div className={`notif ${notif.type==="error"?"error":""}`}>{notif.type==="ok"?"✓ ":""}{notif.msg}</div>}

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <button className="nav-logo" onClick={()=>go("home")}>
            <span className="bebas" style={{fontSize:24,color:GOLD,letterSpacing:2}}>BIGSLAME</span>
            <span className="bebas" style={{fontSize:24,color:"#fff",letterSpacing:2}}> ACADEMY</span>
          </button>
          <div className="nav-desk"><NavActions /></div>
          <button className="nav-burger" onClick={()=>setBurgerOpen(o=>!o)}>{burgerOpen?"✕":"☰"}</button>
        </div>
        {burgerOpen && <div className="mob-menu slide-down"><div className="mob-inner"><NavActions mob /></div></div>}
      </nav>

      {/* MODAL CODE ADMIN */}
      {showAdminCode && (
        <div className="overlay">
          <div className="card modal fade-in">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:22}}>
              <span style={{fontSize:11,color:"#555",letterSpacing:2}}>ACCÈS RESTREINT</span>
              <button onClick={()=>{setShowAdminCode(false);setAdminCode("");setAdminCodeErr("");}} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:18}}>✕</button>
            </div>
            <input className="input" type="password" placeholder="Code" value={adminCode}
              onChange={e=>{setAdminCode(e.target.value);setAdminCodeErr("");}}
              onKeyDown={e=>e.key==="Enter"&&handleAdminCode()}
              style={{textAlign:"center",fontSize:28,letterSpacing:12}} autoFocus />
            {adminCodeErr&&<p style={{color:"#ef4444",fontSize:12,marginTop:10,textAlign:"center"}}>{adminCodeErr}</p>}
            <button className="btn-gold" style={{width:"100%",padding:13,borderRadius:8,fontSize:15,marginTop:16}} onClick={handleAdminCode}>Valider</button>
          </div>
        </div>
      )}

      {/* MODAL CONNEXION */}
      {showLogin && (
        <div className="overlay">
          <div className="card modal fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:26}}>
              <span className="bebas" style={{fontSize:26,color:GOLD}}>CONNEXION</span>
              <button onClick={()=>{setShowLogin(false);setLoginError("");}} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:20}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Email</label>
              <input className="input" type="email" placeholder="ton@email.com" value={loginForm.email}
                onChange={e=>{setLoginForm(f=>({...f,email:e.target.value}));setLoginError("");}} />
            </div>
            <div style={{marginBottom:22}}>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Mot de passe</label>
              <input className="input" type="password" placeholder="••••••••" value={loginForm.password}
                onChange={e=>{setLoginForm(f=>({...f,password:e.target.value}));setLoginError("");}}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            </div>
            {loginError&&<p style={{color:"#ef4444",fontSize:13,marginBottom:14}}>{loginError}</p>}
            <button className="btn-gold" style={{width:"100%",padding:14,borderRadius:8,fontSize:15}} onClick={handleLogin} disabled={loginBusy}>
              {loginBusy?"Connexion…":"Se connecter"}
            </button>
            <p style={{textAlign:"center",fontSize:12,color:"#555",marginTop:16}}>
              Pas encore élève ?{" "}
              <button style={{background:"none",border:"none",color:GOLD,cursor:"pointer",fontSize:12,fontWeight:600}}
                onClick={()=>{setShowLogin(false);document.getElementById("offers")?.scrollIntoView({behavior:"smooth"});}}>
                Voir les offres →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION */}
      {showRegister && (
        <div className="overlay">
          <div className="card modal fade-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span className="bebas" style={{fontSize:20,color:GOLD}}>PACK {showRegister.toUpperCase()}</span>
              <button onClick={()=>setShowRegister(null)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:20}}>✕</button>
            </div>
            <p style={{color:"#888",fontSize:13,marginBottom:20,lineHeight:1.7}}>Pas de paiement automatique. Tu discutes avec BigSlame et tu paies par <strong style={{color:"#fff"}}>Mobile Money</strong>.</p>
            <div style={{background:"#F5A62315",border:`1px solid ${GOLD}`,borderRadius:10,padding:16,marginBottom:20}}>
              <p style={{fontSize:12,color:GOLD,fontWeight:600,marginBottom:8}}>📱 Contact BigSlame</p>
              <p style={{fontSize:16,color:"#fff",fontWeight:700}}>+243 834 604 734</p>
            </div>
            <button className="btn-gold" style={{width:"100%",padding:14,borderRadius:8,fontSize:15}}
              onClick={()=>{window.open(`https://wa.me/243834604734?text=Bonjour BigSlame ! Je souhaite m'inscrire au Pack ${showRegister}. Pouvez-vous m'expliquer la procédure ?`,"_blank");setShowRegister(null);}}>
              💬 Contacter sur WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════ PAGE ACCUEIL ══════════════════ */}
      {page==="home" && (
        <div className="fade-in">
          <section className="hero-sec">
            <div className="hero-grid">
              <div>
                <span style={{fontSize:12,letterSpacing:4,color:GOLD,fontWeight:600}}>🎹 BEATMAKING ACADEMY</span>
                <h1 className="bebas hero-h1" style={{color:"#fff",marginTop:14}}>
                  BIG<br/><span style={{color:GOLD}}>SLAME</span><br/>ACADEMY
                </h1>
                <p style={{marginTop:18,fontSize:17,color:"#888",lineHeight:1.7,maxWidth:430}}>
                  Maîtrise FL Studio, crée des beats pro en Drill, Trap et Afrobeat. Formation personnalisée avec accompagnement direct.
                </p>
                <div className="hero-btns">
                  <button className="btn-gold" style={{padding:"13px 28px",borderRadius:8,fontSize:15}} onClick={()=>document.getElementById("offers")?.scrollIntoView({behavior:"smooth"})}>Voir les offres</button>
                  <button className="btn-outline" style={{padding:"13px 28px",borderRadius:8,fontSize:15}} onClick={()=>document.getElementById("beats")?.scrollIntoView({behavior:"smooth"})}>🎵 Écouter mes prods</button>
                </div>
              </div>

              {/* LECTEUR AUDIO */}
              <div id="beats" className="card" style={{padding:20}}>
                <h3 style={{color:GOLD,fontSize:11,letterSpacing:3,marginBottom:18,fontWeight:600}}>🎵 PRODS BIGSLAME</h3>
                {beats.length===0
                  ? <Empty icon="🎛️" text="Les prods arrivent bientôt…" />
                  : beats.map(beat=>(
                    <div key={beat.id} style={{padding:"12px 0",borderBottom:`1px solid ${BORDER}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <button onClick={()=>togglePlay(beat)}
                          style={{width:38,height:38,borderRadius:"50%",background:playing===beat.id?GOLD:SURF2,border:`1px solid ${playing===beat.id?GOLD:BORDER}`,color:playing===beat.id?"#000":"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {playing===beat.id?"⏸":"▶"}
                        </button>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontWeight:600,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{beat.title}</p>
                          <div style={{display:"flex",gap:8}}>
                            {beat.bpm&&<span style={{fontSize:11,color:"#888"}}>{beat.bpm} BPM</span>}
                            <span style={{fontSize:11,color:GOLD}}>{beat.style}</span>
                          </div>
                        </div>
                        <span style={{fontSize:11,color:"#555",flexShrink:0}}>{(beat.plays||0).toLocaleString()} plays</span>
                      </div>
                      {playing===beat.id&&(
                        <>
                          <div style={{display:"flex",alignItems:"center",gap:3,height:30,marginTop:8}}>
                            {Array.from({length:20},(_,i)=>(
                              <div key={i} className="waveform-bar" style={{width:3,height:Math.round(Math.random()*18+8),animationDelay:`${i*.05}s`}} />
                            ))}
                          </div>
                          <div style={{marginTop:6,height:3,background:BORDER,borderRadius:2}}>
                            <div style={{width:`${audioProgress}%`,height:"100%",background:GOLD,borderRadius:2,transition:"width .5s"}} />
                          </div>
                        </>
                      )}
                    </div>
                  ))
                }
              </div>
            </div>
          </section>

          {/* OFFRES */}
          <section id="offers" className="off-sec">
            <div className="off-inner">
              <div style={{textAlign:"center",marginBottom:50}}>
                <span style={{fontSize:11,letterSpacing:4,color:GOLD,fontWeight:600}}>FORMATIONS</span>
                <h2 className="bebas" style={{fontSize:56,color:"#fff",marginTop:8}}>CHOISIS TON PACK</h2>
              </div>
              <div className="plans-grid">
                <div className="plan-card card" style={{padding:28,borderColor:"#C0C0C030"}}>
                  <span className="badge badge-silver" style={{marginBottom:16,display:"block"}}>SILVER</span>
                  <div style={{marginBottom:20}}><span className="bebas" style={{fontSize:48,color:"#C0C0C0"}}>$21</span><span style={{fontSize:22,color:"#C0C0C0"}}>.99</span></div>
                  <ul style={{listStyle:"none",marginBottom:28}}>{["✓ Maîtrise FL Studio","✓ Style Drill","✓ 1 Drum Kit Drill","✗ Pas d'assistance"].map((f,i)=><li key={i} style={{padding:"8px 0",borderBottom:`1px solid ${BORDER}`,fontSize:14,color:f.startsWith("✗")?"#555":"#ccc"}}>{f}</li>)}</ul>
                  <button className="btn-outline" style={{width:"100%",padding:13,borderRadius:8,fontSize:14}} onClick={()=>setShowRegister("Silver")}>S'inscrire →</button>
                </div>
                <div className="plan-card featured" style={{padding:28,background:"#F5A62308"}}>
                  <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:GOLD,color:"#000",padding:"4px 16px",borderRadius:99,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>POPULAIRE</div>
                  <span className="badge badge-gold" style={{marginBottom:16,display:"block"}}>GOLD</span>
                  <div style={{marginBottom:20}}><span className="bebas" style={{fontSize:48,color:GOLD}}>$47</span><span style={{fontSize:22,color:GOLD}}>.99</span></div>
                  <ul style={{listStyle:"none",marginBottom:28}}>{["✓ 3 Styles (Drill, Trap, Afrobeat)","✓ 3 Drum Kits","✓ 1 mois d'assistance","✓ Envoi fichiers audio","✓ Chat privé"].map((f,i)=><li key={i} style={{padding:"8px 0",borderBottom:`1px solid ${BORDER}`,fontSize:14,color:"#ccc"}}>{f}</li>)}</ul>
                  <button className="btn-gold" style={{width:"100%",padding:13,borderRadius:8,fontSize:14}} onClick={()=>setShowRegister("Gold")}>S'inscrire →</button>
                </div>
                <div className="plan-card card" style={{padding:28,borderColor:"#E5E4E230"}}>
                  <span className="badge badge-platinum" style={{marginBottom:16,display:"block"}}>PLATINUM</span>
                  <div style={{marginBottom:20}}><span className="bebas" style={{fontSize:48,color:"#E5E4E2"}}>$87</span><span style={{fontSize:22,color:"#E5E4E2"}}>.99</span></div>
                  <ul style={{listStyle:"none",marginBottom:28}}>{["✓ 8+ Styles complets","✓ TOUS les Drum Kits","✓ 3 VST inclus (Nexus, Serum, Omni)","✓ 1 mois d'assistance","✓ Masterclass exclusive"].map((f,i)=><li key={i} style={{padding:"8px 0",borderBottom:`1px solid ${BORDER}`,fontSize:14,color:"#ccc"}}>{f}</li>)}</ul>
                  <button className="btn-outline" style={{width:"100%",padding:13,borderRadius:8,fontSize:14,borderColor:"#E5E4E250",color:"#E5E4E2"}} onClick={()=>setShowRegister("Platinum")}>S'inscrire →</button>
                </div>
              </div>
            </div>
          </section>

          {/* TOP 5 */}
          <section className="t5-sec">
            <div className="t5-inner">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:8,marginBottom:30}}>
                <div>
                  <span style={{fontSize:11,letterSpacing:4,color:GOLD,fontWeight:600}}>CLASSEMENT</span>
                  <h2 className="bebas" style={{fontSize:48,color:"#fff"}}>TOP 5 ÉLÈVES</h2>
                </div>
                <span style={{fontSize:11,color:"#555"}}>Mis à jour chaque semaine</span>
              </div>
              {top5.length===0
                ? <Empty icon="🏆" text="Le classement apparaîtra ici dès les premiers élèves." />
                : top5.map((s,i)=>{
                  const name=s.student_name||"—", bc=s.beats_count||0, maxB=top5[0]?.beats_count||1;
                  return (
                    <div key={s.rank} className="card" style={{display:"flex",alignItems:"center",gap:14,padding:"13px 18px",marginBottom:10}}>
                      <span className={`rank-num ${i===0?"top":""}`}>{s.rank}</span>
                      <div style={{width:36,height:36,borderRadius:"50%",background:i===0?`${GOLD}22`:SURF2,border:`1px solid ${i===0?GOLD:BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i===0?GOLD:"#888",flexShrink:0}}>{name.slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontWeight:600,fontSize:14,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</p>
                        <p style={{fontSize:12,color:"#888"}}>{s.style||"—"}</p>
                      </div>
                      <div style={{textAlign:"right",minWidth:86,flexShrink:0}}>
                        <p style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:5}}>{bc} beats</p>
                        <div className="progress-bar" style={{width:86}}><div className="progress-fill" style={{width:`${Math.round((bc/maxB)*100)}%`}} /></div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </section>

          <footer className="footer">
            <span className="bebas" style={{fontSize:22,color:GOLD}}>BIGSLAME ACADEMY</span>
            <p style={{fontSize:12,color:"#555",marginTop:6}}>© 2026 BigSlame — Tous droits réservés</p>
            <button onClick={()=>setShowAdminCode(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:"#1a1a1a",display:"block",margin:"20px auto 0"}}>·</button>
          </footer>
        </div>
      )}

      {/* ══════════════════ ESPACE ÉLÈVE ══════════════════ */}
      {page==="dashboard" && session && !isAdmin && (
        <div className="dash-wrap fade-in">
          <div className="dash-head">
            <div>
              <h2 className="bebas" style={{fontSize:34,color:"#fff"}}>MON ESPACE</h2>
              <div style={{display:"flex",gap:8,marginTop:4,alignItems:"center"}}>
                <span className={`badge badge-${(profile?.plan||"silver").toLowerCase()}`}>{profile?.plan||"Élève"}</span>
                <span style={{fontSize:13,color:"#888"}}>• {profile?.username||session.user.email}</span>
              </div>
            </div>
            {profile?.assistance_end_date&&(
              <div style={{background:`${GOLD}15`,border:`1px solid ${GOLD}30`,borderRadius:10,padding:"12px 18px",textAlign:"center"}}>
                <p style={{fontSize:11,color:"#888"}}>Assistance restante</p>
                <p className="bebas" style={{fontSize:26,color:GOLD}}>
                  {Math.max(0,Math.ceil((new Date(profile.assistance_end_date)-Date.now())/86400000))} JOURS
                </p>
              </div>
            )}
          </div>

          <div className="tabs-row">
            {[["resources","📦 Ressources"],["upload","🎵 Envoyer un beat"],["chat","💬 Chat BigSlame"]].map(([t,l])=>(
              <button key={t} className={`tab-btn ${studTab===t?"active":""}`} style={{padding:"8px 14px",fontSize:13}} onClick={()=>setStudTab(t)}>{l}</button>
            ))}
          </div>

          {studTab==="resources"&&(
            <div style={{display:"grid",gap:10}}>
              {(RESOURCES[profile?.plan]||RESOURCES.Silver).map((r,i)=>(
                <div key={i} className="card2" style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px"}}>
                  <span style={{fontSize:26,flexShrink:0}}>{r.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontWeight:600,fontSize:14}}>{r.name}</p>
                    <span className="badge" style={{marginTop:4,background:"#ffffff10",color:"#888",fontSize:10}}>{r.type.toUpperCase()}</span>
                  </div>
                  <button className="btn-gold" style={{padding:"8px 16px",borderRadius:6,fontSize:13,flexShrink:0}}>Télécharger</button>
                </div>
              ))}
            </div>
          )}

          {studTab==="upload"&&(
            <>
              {profile?.plan==="Silver"
                ?(
                  <div className="card" style={{padding:36,textAlign:"center"}}>
                    <span style={{fontSize:44}}>🔒</span>
                    <p style={{color:"#888",marginTop:14,fontSize:14}}>Disponible avec les packs <strong style={{color:GOLD}}>Gold</strong> et <strong style={{color:"#E5E4E2"}}>Platinum</strong>.</p>
                    <button className="btn-gold" style={{padding:"12px 24px",borderRadius:8,fontSize:14,marginTop:18}} onClick={()=>setShowRegister("Gold")}>Upgrader vers Gold</button>
                  </div>
                ):(
                  <>
                    <div className={`upload-zone ${studentFile?"active":""}`} style={{padding:"30px 16px"}} onClick={()=>studentFileRef.current?.click()}>
                      <input ref={studentFileRef} type="file" accept=".mp3,.wav" style={{display:"none"}} onChange={e=>setStudentFile(e.target.files[0])} />
                      <span style={{fontSize:42}}>🎵</span>
                      <p style={{color:studentFile?GOLD:"#888",marginTop:10,fontSize:14,fontWeight:studentFile?600:400}}>
                        {studentFile?`✓ ${studentFile.name}`:"Glisse ton fichier ici ou clique"}
                      </p>
                      <p style={{fontSize:12,color:"#555",marginTop:6}}>.mp3 ou .wav — Max 100 MB</p>
                    </div>
                    <div style={{display:"flex",gap:10,marginTop:14}}>
                      <button className="btn-outline" style={{padding:"10px 20px",borderRadius:6,fontSize:14}} onClick={()=>studentFileRef.current?.click()}>Choisir un fichier</button>
                      <button className="btn-gold" style={{padding:"10px 24px",borderRadius:6,fontSize:14,flex:1}} onClick={handleStudentUpload} disabled={!studentFile||uploadBusy}>
                        {uploadBusy?"Envoi en cours…":"Envoyer pour correction →"}
                      </button>
                    </div>
                    <div style={{marginTop:24}}>
                      <h4 style={{color:"#888",fontSize:11,marginBottom:10,letterSpacing:2}}>BEATS ENVOYÉS ({myBeats.length})</h4>
                      {myBeats.length===0
                        ? <Empty icon="🎛️" text="Tu n'as pas encore envoyé de beat." />
                        : myBeats.map(f=>(
                          <div key={f.id} className="card2" style={{display:"flex",alignItems:"center",padding:"12px 14px",marginBottom:8,gap:10}}>
                            <span>🎵</span>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.file_name}</p>
                              <p style={{fontSize:11,color:"#555"}}>{new Date(f.submitted_at).toLocaleDateString()}</p>
                            </div>
                            <span className={`badge ${f.status==="corrected"?"badge-green":f.status==="reviewed"?"badge-gold":"badge-orange"}`}>
                              {f.status==="corrected"?"Corrigé ✓":f.status==="reviewed"?"En révision":"En attente"}
                            </span>
                          </div>
                        ))
                      }
                    </div>
                  </>
                )
              }
            </>
          )}

          {studTab==="chat"&&(
            <div className="card" style={{display:"flex",flexDirection:"column",height:460}}>
              <div style={{padding:"13px 18px",borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`${GOLD}22`,border:`1px solid ${GOLD}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:GOLD}}>BS</div>
                <div><p style={{fontWeight:600,fontSize:14}}>BigSlame</p><p style={{fontSize:11,color:"#22c55e"}}>● Disponible</p></div>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
                {messages.length===0
                  ? <Empty icon="💬" text="Pas encore de message. Dis bonjour !" />
                  : messages.map(msg=>{
                    const mine=msg.sender_id===session.user.id;
                    return (
                      <div key={msg.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start"}}>
                        <div>
                          <div className={`msg-bubble ${mine?"msg-admin":"msg-user"}`}>{msg.content}</div>
                          <p style={{fontSize:10,color:"#444",marginTop:3,textAlign:mine?"right":"left"}}>{new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
                        </div>
                      </div>
                    );
                  })
                }
                <div ref={chatEndRef} />
              </div>
              <div style={{padding:"10px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8}}>
                <input className="input" placeholder="Écris ton message…" value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} style={{flex:1}} />
                <button className="btn-gold" style={{padding:"10px 16px",borderRadius:6,fontSize:16,flexShrink:0}} onClick={sendMsg}>→</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ ADMIN DASHBOARD ══════════════════ */}
      {page==="admin" && isAdmin && (
        <div className="adm-wrap fade-in">
          <div className="adm-head">
            <div>
              <h2 className="bebas" style={{fontSize:32,color:"#fff"}}>ADMIN DASHBOARD</h2>
              <p style={{color:"#888",fontSize:13}}>BigSlame 👑</p>
            </div>
            {/* ✅ FIX stats — utilise les variables filtrées activeStudents / pendingStudents */}
            <div className="stats-row">
              {[
                { label:"Élèves actifs", val:activeStudents.length },
                { label:"En attente",    val:pendingStudents.length },
                { label:"Revenus/mois",  val:"$"+totalRevenue.toFixed(0) },
              ].map(m=>(
                <div key={m.label} className="card2" style={{padding:"12px 10px",textAlign:"center"}}>
                  <p style={{fontSize:11,color:"#888"}}>{m.label}</p>
                  <p className="bebas" style={{fontSize:26,color:GOLD}}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="tabs-row">
            {[
              ["students","👥 Élèves"],
              ["create","➕ Créer un compte"],
              ["beats","🎵 Poster un Beat"],
              ["messages", unreadCount>0 ? `💬 Messages (${unreadCount})` : "💬 Messages"],
              ["top5","🏆 Top 5"],
            ].map(([t,l])=>(
              <button key={t} className={`tab-btn ${adminTab===t?"active":""}`} style={{padding:"8px 14px",fontSize:13,position:"relative"}}
                onClick={()=>{ setAdminTab(t); setCreatedCreds(null); if(t==="messages") setUnreadCount(0); }}>
                {l}
              </button>
            ))}
          </div>

          {/* ÉLÈVES */}
          {adminTab==="students"&&(
            <div>
              {pendingStudents.length>0&&(
                <div style={{background:"#f9731610",border:"1px solid #f9731630",borderRadius:10,padding:14,marginBottom:18}}>
                  <p style={{color:"#f97316",fontWeight:600,fontSize:14,marginBottom:10}}>⏳ {pendingStudents.length} inscription(s) en attente</p>
                  {pendingStudents.map(s=>(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,background:SURF2,borderRadius:8,padding:"10px 12px",marginBottom:8,flexWrap:"wrap"}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:"#f9731622",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#f97316",flexShrink:0}}>{(s.username||"?").slice(0,2).toUpperCase()}</div>
                      <div style={{flex:1,minWidth:80}}>
                        <p style={{fontWeight:600,fontSize:14}}>{s.username||"Inconnu"}</p>
                        <p style={{fontSize:12,color:"#888"}}>Pack {s.plan||"—"}</p>
                      </div>
                      <button className="btn-gold" style={{padding:"8px 14px",borderRadius:6,fontSize:13}} onClick={()=>handleValidate(s.id)}>✓ Valider</button>
                    </div>
                  ))}
                </div>
              )}
              {activeStudents.length===0
                ? <Empty icon="👥" text="Aucun élève actif. Utilise ➕ Créer un compte pour en ajouter." />
                : (
                  <div className="tbl-scroll">
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{borderBottom:`1px solid ${BORDER}`}}>
                          {["Élève","Plan","Statut","Inscription"].map(h=>(
                            <th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:11,color:"#555",letterSpacing:1,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeStudents.map(s=>(
                          <tr key={s.id} style={{borderBottom:`1px solid ${BORDER}`}}>
                            <td style={{padding:"10px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <div style={{width:28,height:28,borderRadius:"50%",background:`${GOLD}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:GOLD,flexShrink:0}}>{(s.username||"?").slice(0,2).toUpperCase()}</div>
                                <span style={{fontSize:13}}>{s.username||s.id.slice(0,8)}</span>
                              </div>
                            </td>
                            <td style={{padding:"10px"}}><span className={`badge badge-${(s.plan||"silver").toLowerCase()}`}>{s.plan||"—"}</span></td>
                            <td style={{padding:"10px"}}><span className="badge badge-green">Actif</span></td>
                            <td style={{padding:"10px",fontSize:12,color:"#888",whiteSpace:"nowrap"}}>{new Date(s.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          )}

          {/* CRÉER UN COMPTE */}
          {adminTab==="create"&&(
            <div style={{maxWidth:540}}>
              <p style={{color:"#888",fontSize:14,marginBottom:24,lineHeight:1.7}}>Quand un élève paie par Mobile Money, crée son compte ici. Il reçoit ses identifiants pour se connecter.</p>
              {!createdCreds?(
                <div className="card" style={{padding:28}}>
                  <h3 style={{color:GOLD,fontSize:13,letterSpacing:2,marginBottom:20}}>NOUVEAU COMPTE ÉLÈVE</h3>
                  <div style={{display:"grid",gap:14}}>
                    <div>
                      <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Nom d'utilisateur *</label>
                      <input className="input" placeholder="ex: LilBeatz_Kinshasa" value={newStudent.username} onChange={e=>setNewStudent(s=>({...s,username:e.target.value}))} />
                    </div>
                    <div>
                      <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Email *</label>
                      <input className="input" type="email" placeholder="eleve@email.com" value={newStudent.email} onChange={e=>setNewStudent(s=>({...s,email:e.target.value}))} />
                    </div>
                    <div>
                      <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Mot de passe *</label>
                      <div style={{display:"flex",gap:8}}>
                        <input className="input" value={newStudent.password} onChange={e=>setNewStudent(s=>({...s,password:e.target.value}))} style={{flex:1}} />
                        <button className="btn-outline" style={{padding:"0 14px",borderRadius:6,fontSize:12,whiteSpace:"nowrap"}} onClick={()=>setNewStudent(s=>({...s,password:genPassword()}))}>🔄 Générer</button>
                      </div>
                    </div>
                    <div>
                      <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Abonnement payé *</label>
                      <select className="input" value={newStudent.plan} onChange={e=>setNewStudent(s=>({...s,plan:e.target.value}))}>
                        <option value="Silver">Silver — $21.99</option>
                        <option value="Gold">Gold — $47.99</option>
                        <option value="Platinum">Platinum — $87.99</option>
                      </select>
                    </div>
                    <button className="btn-gold" style={{padding:14,borderRadius:8,fontSize:15,marginTop:4}} onClick={handleCreateStudent} disabled={createBusy}>
                      {createBusy?"Création en cours…":"✅ Créer le compte élève"}
                    </button>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{background:"#22c55e15",border:"1px solid #22c55e40",borderRadius:12,padding:20,marginBottom:20}}>
                    <p style={{color:"#22c55e",fontWeight:700,fontSize:15,marginBottom:4}}>✅ Compte créé !</p>
                    <p style={{fontSize:13,color:"#888"}}>Envoie ces identifiants à <strong style={{color:"#fff"}}>{createdCreds.username}</strong></p>
                  </div>
                  {[{label:"Nom d'utilisateur",val:createdCreds.username},{label:"Email",val:createdCreds.email},{label:"Mot de passe",val:createdCreds.password},{label:"Abonnement",val:createdCreds.plan}].map(({label,val})=>(
                    <div key={label} style={{marginBottom:12}}>
                      <p style={{fontSize:12,color:"#888",marginBottom:4}}>{label}</p>
                      <div className="copy-box" onClick={()=>copyToClipboard(val)}>{val} <span style={{color:"#555",fontSize:11}}>(clic = copier)</span></div>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:10,marginTop:20}}>
                    <button className="btn-gold" style={{flex:1,padding:13,borderRadius:8,fontSize:14}}
                      onClick={()=>window.open(`https://wa.me/243834604734?text=${encodeURIComponent(`Bonjour ${createdCreds.username} ! 🎹\n\nTon compte BigSlame Academy est actif !\n\n📧 Email : ${createdCreds.email}\n🔑 Mot de passe : ${createdCreds.password}\n🎓 Pack : ${createdCreds.plan}\n\nConnecte-toi sur : big-slame-academy.vercel.app\n\nBienvenue 🔥`)}`,"_blank")}>
                      💬 Envoyer sur WhatsApp
                    </button>
                    <button className="btn-outline" style={{padding:13,borderRadius:8,fontSize:14}} onClick={()=>{setCreatedCreds(null);setNewStudent({username:"",email:"",password:genPassword(),plan:"Silver"});}}>+ Nouveau</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* POSTER UN BEAT */}
          {adminTab==="beats"&&(
            <div style={{maxWidth:560}}>
              <div className="card" style={{padding:24,marginBottom:20}}>
                <h3 style={{color:GOLD,fontSize:12,letterSpacing:2,marginBottom:20}}>AJOUTER UN BEAT</h3>
                <div style={{display:"grid",gap:14}}>
                  <div>
                    <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Titre *</label>
                    <input className="input" placeholder="ex: Midnight Drill Vol.4" value={newBeat.title} onChange={e=>setNewBeat(b=>({...b,title:e.target.value}))} />
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>BPM</label>
                      <input className="input" type="number" placeholder="140" value={newBeat.bpm} onChange={e=>setNewBeat(b=>({...b,bpm:e.target.value}))} />
                    </div>
                    <div>
                      <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Style</label>
                      <select className="input" value={newBeat.style} onChange={e=>setNewBeat(b=>({...b,style:e.target.value}))}><option>Drill</option><option>Trap</option><option>Afrobeat</option><option>Autre</option></select>
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Fichier audio (.mp3 / .wav)</label>
                    <input ref={beatFileRef} type="file" accept=".mp3,.wav,audio/*" style={{display:"none"}} onChange={e=>setBeatFile(e.target.files[0])} />
                    <div className={`upload-zone ${beatFile?"active":""}`} style={{padding:"20px 16px"}} onClick={()=>beatFileRef.current?.click()}>
                      <span style={{fontSize:32}}>{beatFile?"🎵":"📁"}</span>
                      <p style={{color:beatFile?GOLD:"#888",fontSize:13,marginTop:8,fontWeight:beatFile?600:400}}>{beatFile?`✓ ${beatFile.name}`:"Clique pour sélectionner"}</p>
                      <p style={{fontSize:11,color:"#555",marginTop:4}}>MP3 ou WAV — hébergé sur Supabase Storage</p>
                    </div>
                    {beatFile&&<button style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:12,marginTop:6}} onClick={()=>{setBeatFile(null);if(beatFileRef.current)beatFileRef.current.value="";}}>✕ Retirer</button>}
                  </div>
                  <button className="btn-gold" style={{padding:14,borderRadius:8,fontSize:15}} onClick={handlePublishBeat} disabled={beatBusy}>
                    {beatBusy?(beatFile?"Upload en cours…":"Publication…"):"🚀 Publier sur la page d'accueil"}
                  </button>
                </div>
              </div>
              <h4 style={{color:"#888",fontSize:11,letterSpacing:2,marginBottom:12}}>BEATS PUBLIÉS ({beats.length})</h4>
              {beats.length===0
                ? <Empty icon="🎛️" text="Aucun beat publié." />
                : beats.map(b=>(
                  <div key={b.id} className="card2" style={{display:"flex",alignItems:"center",padding:"12px 14px",marginBottom:8,gap:10}}>
                    <span style={{fontSize:20,flexShrink:0}}>🎵</span>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{b.title}</p>
                      <div style={{display:"flex",gap:8,marginTop:2}}>
                        {b.bpm&&<span style={{fontSize:11,color:"#888"}}>{b.bpm} BPM</span>}
                        <span style={{fontSize:11,color:GOLD}}>{b.style}</span>
                        <span style={{fontSize:11,color:"#555"}}>{(b.plays||0)} plays</span>
                      </div>
                    </div>
                    <button className="btn-red" style={{padding:"6px 12px",borderRadius:6,fontSize:12,flexShrink:0}} onClick={()=>handleDeleteBeat(b)}>🗑</button>
                  </div>
                ))
              }
            </div>
          )}

          {/* MESSAGES */}
          {adminTab==="messages"&&(
            <div className="chat-grid">
              <div className="card chat-side" style={{overflow:"hidden"}}>
                <div style={{padding:"12px 14px",borderBottom:`1px solid ${BORDER}`}}>
                  <p style={{fontSize:11,fontWeight:600,color:"#888",letterSpacing:1}}>ÉLÈVES ACTIFS</p>
                </div>
                {activeStudents.length===0
                  ? <p style={{padding:16,fontSize:12,color:"#555"}}>Aucun élève.</p>
                  : activeStudents.map(s=>(
                    <div key={s.id}
                      style={{padding:"10px 12px",borderBottom:`1px solid ${BORDER}`,cursor:"pointer",background:chatWith?.id===s.id?SURF2:"transparent",transition:"background .15s"}}
                      onClick={()=>setChatWith(s)}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:`${GOLD}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:GOLD,flexShrink:0}}>{(s.username||"?").slice(0,2).toUpperCase()}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.username}</p>
                          <span className={`badge badge-${(s.plan||"silver").toLowerCase()}`} style={{fontSize:10}}>{s.plan}</span>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div className="card" style={{display:"flex",flexDirection:"column",minHeight:400}}>
                {!chatWith?(
                  <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Empty icon="💬" text="Sélectionne un élève pour voir la conversation." />
                  </div>
                ):(
                  <>
                    <div style={{padding:"13px 16px",borderBottom:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`${GOLD}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:GOLD}}>{chatWith.username.slice(0,2).toUpperCase()}</div>
                      <div>
                        <p style={{fontWeight:600,fontSize:14}}>{chatWith.username}</p>
                        <span className={`badge badge-${chatWith.plan?.toLowerCase()||"silver"}`} style={{fontSize:10}}>{chatWith.plan}</span>
                      </div>
                    </div>
                    <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10,minHeight:260}}>
                      {messages.length===0
                        ? <Empty icon="💬" text="Pas encore de message." />
                        : messages.map(msg=>{
                          const mine=msg.sender_id===ADMIN_ID;
                          return (
                            <div key={msg.id} style={{display:"flex",justifyContent:mine?"flex-end":"flex-start"}}>
                              <div>
                                <div className={`msg-bubble ${mine?"msg-admin":"msg-user"}`}>{msg.content}</div>
                                <p style={{fontSize:10,color:"#444",marginTop:3,textAlign:mine?"right":"left"}}>{new Date(msg.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
                              </div>
                            </div>
                          );
                        })
                      }
                      <div ref={chatEndRef} />
                    </div>
                    <div style={{padding:"10px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8}}>
                      <input className="input" placeholder={`Répondre à ${chatWith.username}…`} value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} style={{flex:1}} />
                      <button className="btn-gold" style={{padding:"10px 16px",borderRadius:6,fontSize:16,flexShrink:0}} onClick={sendMsg}>→</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TOP 5 */}
          {adminTab==="top5"&&(
            <div style={{maxWidth:520}}>
              <p style={{color:"#888",fontSize:13,marginBottom:18}}>Modifie le classement manuellement chaque semaine.</p>
              {top5Edit.length===0
                ? <Empty icon="🏆" text="Aucune entrée (crée 5 lignes dans Supabase → table top5)." />
                : top5Edit.map((s,i)=>(
                  <div key={s.rank} className="card2" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:10}}>
                    <span className="bebas" style={{fontSize:26,color:i===0?GOLD:"#444",minWidth:32}}>#{s.rank}</span>
                    <input className="input" value={s.student_name||""} placeholder="Nom de l'élève"
                      onChange={e=>{const n=[...top5Edit];n[i]={...n[i],student_name:e.target.value};setTop5Edit(n);}} style={{flex:1}} />
                    <input className="input" type="number" value={s.beats_count||0}
                      onChange={e=>{const n=[...top5Edit];n[i]={...n[i],beats_count:+e.target.value||0};setTop5Edit(n);}} style={{width:68}} />
                    <span style={{fontSize:11,color:"#888",flexShrink:0}}>beats</span>
                  </div>
                ))
              }
              {top5Edit.length>0&&<button className="btn-gold" style={{padding:"12px 28px",borderRadius:8,fontSize:14,marginTop:6}} onClick={saveTop5}>💾 Sauvegarder</button>}
            </div>
          )}
        </div>
      )}
    </>
  );
}

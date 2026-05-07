"use client"; // Doit être la TOUTE PREMIÈRE ligne

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Pour connecter ta base de données

const GOLD = "#F5A623";
const DARK = "#0A0A0A";
const SURFACE = "#141414";
const SURFACE2 = "#1E1E1E";
const BORDER = "#2A2A2A";

const mockStudents = [
  { id: 1, name: "LilBeatz_237", plan: "Gold", joined: "2024-03-01", validated: true, avatar: "LB", beats: 12, status: "active" },
  { id: 2, name: "DrumKing_CI", plan: "Platinum", joined: "2024-02-15", validated: true, avatar: "DK", beats: 28, status: "active" },
  { id: 3, name: "TrapSoul_Dakar", plan: "Silver", joined: "2024-03-10", validated: true, avatar: "TS", beats: 5, status: "active" },
  { id: 4, name: "BeatMaker_RDC", plan: "Gold", joined: "2024-03-20", validated: false, avatar: "BM", beats: 0, status: "pending" },
  { id: 5, name: "AfroVibes_Abidjan", plan: "Platinum", joined: "2024-03-18", validated: false, avatar: "AV", beats: 0, status: "pending" },
];

const top5 = [
  { rank: 1, name: "DrumKing_CI", style: "Afrobeat", beats: 28, progress: 100 },
  { rank: 2, name: "LilBeatz_237", style: "Drill", beats: 12, progress: 43 },
  { rank: 3, name: "AfroVibes_Abidjan", style: "Trap", beats: 9, progress: 32 },
  { rank: 4, name: "TrapSoul_Dakar", style: "Drill", beats: 5, progress: 18 },
  { rank: 5, name: "SoundWave_Lagos", style: "Afrobeat", beats: 3, progress: 11 },
];

const mockBeats = [
  { id: 1, title: "Midnight Drill Vol.1", bpm: 140, style: "Drill", duration: "2:34", plays: 1240 },
  { id: 2, title: "Afrowave 2025", bpm: 98, style: "Afrobeat", duration: "3:12", plays: 890 },
  { id: 3, title: "Trap Nation", bpm: 130, style: "Trap", duration: "2:48", plays: 620 },
];

const resources = {
  Silver: [
    { name: "FL Studio - Guide Complet (PDF)", type: "pdf", icon: "📄" },
    { name: "Drum Kit Drill - BigSlame Pack", type: "zip", icon: "🥁" },
    { name: "Vidéo : Maîtriser les patterns Drill", type: "video", icon: "🎥" },
  ],
  Gold: [
    { name: "FL Studio - Guide Complet (PDF)", type: "pdf", icon: "📄" },
    { name: "Drum Kit Drill + Trap + Afrobeat", type: "zip", icon: "🥁" },
    { name: "3 Vidéos tutoriels (Drill, Trap, Afrobeat)", type: "video", icon: "🎥" },
    { name: "MIDI Pack - 50 progressions", type: "zip", icon: "🎹" },
  ],
  Platinum: [
    { name: "ALL Drum Kits (8 styles)", type: "zip", icon: "🥁" },
    { name: "VST Nexus 2 - Lien téléchargement", type: "link", icon: "🔗" },
    { name: "VST Serum - Lien téléchargement", type: "link", icon: "🔗" },
    { name: "VST Omnisphere - Lien téléchargement", type: "link", icon: "🔗" },
    { name: "Vidéos 8 styles complets", type: "video", icon: "🎥" },
    { name: "Masterclass BigSlame (Exclusif)", type: "video", icon: "🎥" },
  ],
};

const mockMessages = [
  { id: 1, from: "LilBeatz_237", text: "Bonjour BigSlame, j'ai un souci avec mes hi-hats en Drill", time: "10:32", fromAdmin: false },
  { id: 2, from: "Admin", text: "Salut ! Envoie-moi ton projet FL, je regarde ça ce soir", time: "10:45", fromAdmin: true },
  { id: 3, from: "LilBeatz_237", text: "Merci ! Je viens de t'envoyer le fichier audio", time: "11:00", fromAdmin: false },
];

function cn(...classes) { return classes.filter(Boolean).join(" "); }

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${DARK}; color: #fff; font-family: 'Space Grotesk', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: ${SURFACE}; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  .bebas { font-family: 'Bebas Neue', cursive; }
  .gold { color: ${GOLD}; }
  .btn-gold { background: ${GOLD}; color: #000; border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-weight: 700; transition: all 0.2s; }
  .btn-gold:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-outline { background: transparent; border: 1px solid ${BORDER}; color: #fff; cursor: pointer; font-family: 'Space Grotesk', sans-serif; transition: all 0.2s; }
  .btn-outline:hover { border-color: ${GOLD}; color: ${GOLD}; }
  .card { background: ${SURFACE}; border: 1px solid ${BORDER}; border-radius: 12px; }
  .card2 { background: ${SURFACE2}; border: 1px solid ${BORDER}; border-radius: 8px; }
  .input { background: ${SURFACE2}; border: 1px solid ${BORDER}; color: #fff; border-radius: 6px; padding: 10px 14px; width: 100%; font-family: 'Space Grotesk', sans-serif; font-size: 14px; outline: none; }
  .input:focus { border-color: ${GOLD}; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
  .badge-gold { background: #F5A62322; color: ${GOLD}; }
  .badge-silver { background: #C0C0C022; color: #C0C0C0; }
  .badge-platinum { background: #E5E4E222; color: #E5E4E2; }
  .badge-green { background: #22c55e22; color: #22c55e; }
  .badge-orange { background: #f9731622; color: #f97316; }
  .nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid ${BORDER}; }
  .tab-btn { background: transparent; border: none; color: #888; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 6px; transition: all 0.2s; }
  .tab-btn.active { background: ${SURFACE2}; color: #fff; }
  .tab-btn:hover:not(.active) { color: #ccc; }
  .progress-bar { background: ${BORDER}; border-radius: 99px; height: 4px; }
  .progress-fill { background: ${GOLD}; border-radius: 99px; height: 4px; transition: width 0.6s ease; }
  .msg-bubble { max-width: 75%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
  .msg-admin { background: ${GOLD}; color: #000; border-radius: 12px 12px 4px 12px; }
  .msg-user { background: ${SURFACE2}; color: #fff; border-radius: 12px 12px 12px 4px; }
  .waveform { display: flex; align-items: center; gap: 3px; height: 40px; }
  .waveform-bar { background: ${GOLD}; border-radius: 2px; animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scaleY(0.6); } 50% { opacity: 1; transform: scaleY(1); } }
  .hero-title { font-size: clamp(60px, 12vw, 120px); line-height: 0.9; letter-spacing: -2px; }
  .plan-card { position: relative; border-radius: 16px; padding: 32px; transition: transform 0.2s, border-color 0.2s; }
  .plan-card:hover { transform: translateY(-4px); }
  .plan-card.featured { border: 2px solid ${GOLD}; }
  .rank-num { font-family: 'Bebas Neue', cursive; font-size: 48px; color: ${BORDER}; line-height: 1; }
  .rank-num.top { color: ${GOLD}; }
  .upload-zone { border: 2px dashed ${BORDER}; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
  .upload-zone:hover { border-color: ${GOLD}; background: #F5A62308; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .notification { position: fixed; top: 80px; right: 24px; z-index: 999; background: #22c55e; color: #000; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; animation: fadeIn 0.3s ease; }
`;

export default function BigSlameAcademy() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [playing, setPlaying] = useState(null);
  const [adminTab, setAdminTab] = useState("students");
  const [studentTab, setStudentTab] = useState("resources");
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [students, setStudents] = useState(mockStudents);
  const [notification, setNotification] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(null);
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminCodeError, setAdminCodeError] = useState("");
  const [newBeatTitle, setNewBeatTitle] = useState("");
  const [top5Edit, setTop5Edit] = useState(top5);
  const currentUser = { name: "LilBeatz_237", plan: "Gold" };

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  const handleAdminCode = () => {
    if (adminCode === "0820") {
      setIsAdmin(true); setLoggedIn(true); setShowAdminCode(false); setAdminCode(""); setAdminCodeError(""); setPage("admin"); notify("Connecté en tant qu'Admin 👑");
    } else { setAdminCodeError("Code incorrect"); setAdminCode(""); }
  };

  const handleLogin = () => {
    if (loginForm.email === "eleve@bigslame.com" && loginForm.password === "eleve123") {
      setIsAdmin(false); setLoggedIn(true); setShowLogin(false); setPage("dashboard"); notify("Bienvenue LilBeatz_237 🎤");
    } else { setLoginError("Email ou mot de passe incorrect"); }
  };
  const handleValidate = (id) => {
    setStudents(s => s.map(st => st.id === id ? { ...st, validated: true, status: "active" } : st));
    notify("✅ Élève validé !");
  };

  const handleSendMsg = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, { id: Date.now(), from: isAdmin ? "Admin" : currentUser.name, text: chatMsg, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), fromAdmin: isAdmin }]);
    setChatMsg("");
  };

  return (
    <>
      <style>{styles}</style>
      {notification && <div className="notification">✓ {notification}</div>}

      {/* NAV */}
      <nav className="nav" style={{ padding: "0 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <button onClick={() => setPage("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span className="bebas" style={{ fontSize: 28, color: GOLD, letterSpacing: 2 }}>BIGSLAME</span>
            <span className="bebas" style={{ fontSize: 28, color: "#fff", letterSpacing: 2 }}> ACADEMY</span>
          </button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!loggedIn ? (
              <>
                <button className="btn-outline" style={{ padding: "8px 20px", borderRadius: 6, fontSize: 14 }} onClick={() => setShowLogin(true)}>Connexion</button>
                <button className="btn-gold" style={{ padding: "8px 20px", borderRadius: 6, fontSize: 14 }} onClick={() => { setPage("home"); setTimeout(() => document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" }), 100); }}>S'inscrire</button>
              </>
            ) : isAdmin ? (
              <>
                <span style={{ fontSize: 13, color: "#888" }}>Admin</span>
                <button className="btn-gold" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13 }} onClick={() => setPage("admin")}>Dashboard</button>
                <button className="btn-outline" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13 }} onClick={() => { setLoggedIn(false); setIsAdmin(false); setPage("home"); }}>Déconnexion</button>
              </>
            ) : (
              <>
                <span className="badge badge-gold">{currentUser.plan}</span>
                <button className="btn-gold" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13 }} onClick={() => setPage("dashboard")}>Mon Espace</button>
                <button className="btn-outline" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 13 }} onClick={() => { setLoggedIn(false); setPage("home"); }}>Déconnexion</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div className="card fade-in" style={{ width: 400, padding: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <span className="bebas" style={{ fontSize: 28, color: GOLD }}>CONNEXION</span>
              <button onClick={() => setShowLogin(false)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Email</label>
              <input className="input" placeholder="ton@email.com" value={loginForm.email} onChange={e => { setLoginForm(f => ({ ...f, email: e.target.value })); setLoginError(""); }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Mot de passe</label>
              <input className="input" type="password" placeholder="••••••••" value={loginForm.password} onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {loginError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{loginError}</p>}
            <button className="btn-gold" style={{ width: "100%", padding: 14, borderRadius: 8, fontSize: 15 }} onClick={handleLogin}>Se connecter</button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#555", marginTop: 20 }}>Demo élève : eleve@bigslame.com / eleve123</p>
          </div>
        </div>
      )}

      {/* ADMIN CODE MODAL */}
      {showAdminCode && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600 }}>
          <div className="card fade-in" style={{ width: 320, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: "#555", letterSpacing: 2 }}>ACCÈS RESTREINT</span>
              <button onClick={() => { setShowAdminCode(false); setAdminCode(""); setAdminCodeError(""); }} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <input className="input" type="password" placeholder="Code d'accès" value={adminCode} onChange={e => { setAdminCode(e.target.value); setAdminCodeError(""); }} onKeyDown={e => e.key === "Enter" && handleAdminCode()} style={{ textAlign: "center", fontSize: 22, letterSpacing: 8 }} autoFocus />
            {adminCodeError && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 10, textAlign: "center" }}>{adminCodeError}</p>}
            <button className="btn-gold" style={{ width: "100%", padding: 12, borderRadius: 8, fontSize: 14, marginTop: 16 }} onClick={handleAdminCode}>Valider</button>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegisterModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }}>
          <div className="card fade-in" style={{ width: 440, padding: 36 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="bebas" style={{ fontSize: 24, color: GOLD }}>S'INSCRIRE — PACK {showRegisterModal.toUpperCase()}</span>
              <button onClick={() => setShowRegisterModal(null)} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>L'inscription se fait en direct avec BigSlame. Aucun paiement automatique — vous discutez d'abord, puis vous payez par Mobile Money (Airtel, Orange, etc.).</p>
            <div style={{ background: "#F5A62315", border: `1px solid ${GOLD}`, borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 8 }}>📱 Contacts BigSlame :</p>
              <p style={{ fontSize: 14, color: "#fff" }}>WhatsApp: <strong>+243 834 604 734</strong></p>
            </div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Ou cliquez pour ouvrir directement WhatsApp avec un message pré-rempli :</p>
            <button className="btn-gold" style={{ width: "100%", padding: 14, borderRadius: 8, fontSize: 15 }} onClick={() => { window.open(`https://wa.me/243834604734?text=Bonjour BigSlame ! Je souhaite m'inscrire au Pack ${showRegisterModal}. Pouvez-vous m'expliquer la procédure ?`, "_blank"); setShowRegisterModal(null); }}>
              💬 Contacter BigSlame sur WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* HOME PAGE */}
      {page === "home" && (
        <div className="fade-in">
          {/* HERO */}
          <section style={{ minHeight: "90vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 24px", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 13, letterSpacing: 4, color: GOLD, fontWeight: 600 }}>🎹 BEATMAKING ACADEMY</span>
                <h1 className="bebas hero-title" style={{ marginTop: 16, color: "#fff" }}>
                  BIG<br /><span style={{ color: GOLD }}>SLAME</span><br />ACADEMY
                </h1>
                <p style={{ marginTop: 24, fontSize: 18, color: "#888", lineHeight: 1.7, maxWidth: 440 }}>
                  Maîtrise FL Studio, crée des beats pro en Drill, Trap et Afrobeat. Une formation personnalisée avec un accompagnement direct.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
                  <button className="btn-gold" style={{ padding: "14px 32px", borderRadius: 8, fontSize: 15 }} onClick={() => document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" })}>Voir les offres</button>
                  <button className="btn-outline" style={{ padding: "14px 32px", borderRadius: 8, fontSize: 15 }} onClick={() => document.getElementById("beats")?.scrollIntoView({ behavior: "smooth" })}>🎵 Écouter mes prods</button>
                </div>
              </div>
              <div>
                {/* AUDIO PLAYER */}
                <div id="beats" className="card" style={{ padding: 24 }}>
                  <h3 style={{ color: GOLD, fontSize: 13, letterSpacing: 3, marginBottom: 20, fontWeight: 600 }}>🎵 PRODS BIGSLAME</h3>
                  {mockBeats.map(beat => (
                    <div key={beat.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                      <button onClick={() => setPlaying(playing === beat.id ? null : beat.id)} style={{ width: 40, height: 40, borderRadius: "50%", background: playing === beat.id ? GOLD : SURFACE2, border: `1px solid ${playing === beat.id ? GOLD : BORDER}`, color: playing === beat.id ? "#000" : "#fff", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {playing === beat.id ? "⏸" : "▶"}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{beat.title}</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "#888" }}>{beat.bpm} BPM</span>
                          <span style={{ fontSize: 12, color: "#888" }}>•</span>
                          <span style={{ fontSize: 12, color: GOLD }}>{beat.style}</span>
                        </div>
                        {playing === beat.id && (
                          <div className="waveform" style={{ marginTop: 8 }}>
                            {Array.from({ length: 24 }, (_, i) => (
                              <div key={i} className="waveform-bar" style={{ width: 3, height: Math.random() * 28 + 8, animationDelay: `${i * 0.05}s` }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#555", flexShrink: 0 }}>{beat.plays.toLocaleString()} plays</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PRICING */}
          <section id="offers" style={{ padding: "80px 24px", background: SURFACE }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 60 }}>
                <span style={{ fontSize: 13, letterSpacing: 4, color: GOLD, fontWeight: 600 }}>FORMATIONS</span>
                <h2 className="bebas" style={{ fontSize: 64, color: "#fff", marginTop: 8 }}>CHOISIS TON PACK</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                {/* SILVER */}
                <div className="plan-card card" style={{ borderColor: "#C0C0C030" }}>
                  <span className="badge badge-silver" style={{ marginBottom: 16 }}>SILVER</span>
                  <div style={{ marginBottom: 24 }}>
                    <span className="bebas" style={{ fontSize: 52, color: "#C0C0C0" }}>$21</span>
                    <span style={{ fontSize: 24, color: "#C0C0C0" }}>.99</span>
                  </div>
                  <ul style={{ listStyle: "none", marginBottom: 32 }}>
                    {["✓ Maîtrise FL Studio", "✓ Style Drill", "✓ 1 Drum Kit Drill", "✗ Pas d'assistance"].map((f, i) => (
                      <li key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: f.startsWith("✗") ? "#555" : "#ccc" }}>{f}</li>
                    ))}
                  </ul>
                  <button className="btn-outline" style={{ width: "100%", padding: 14, borderRadius: 8, fontSize: 14 }} onClick={() => setShowRegisterModal("Silver")}>S'inscrire →</button>
                </div>
                {/* GOLD */}
                <div className="plan-card featured" style={{ background: "#F5A62308" }}>
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#000", padding: "4px 20px", borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>POPULAIRE</div>
                  <span className="badge badge-gold" style={{ marginBottom: 16 }}>GOLD</span>
                  <div style={{ marginBottom: 24 }}>
                    <span className="bebas" style={{ fontSize: 52, color: GOLD }}>$47</span>
                    <span style={{ fontSize: 24, color: GOLD }}>.99</span>
                  </div>
                  <ul style={{ listStyle: "none", marginBottom: 32 }}>
                    {["✓ 3 Styles (Drill, Trap, Afrobeat)", "✓ 3 Drum Kits", "✓ 1 mois d'assistance", "✓ Envoi fichiers audio", "✓ Chat privé"].map((f, i) => (
                      <li key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: "#ccc" }}>{f}</li>
                    ))}
                  </ul>
                  <button className="btn-gold" style={{ width: "100%", padding: 14, borderRadius: 8, fontSize: 14 }} onClick={() => setShowRegisterModal("Gold")}>S'inscrire →</button>
                </div>
                {/* PLATINUM */}
                <div className="plan-card card" style={{ borderColor: "#E5E4E230" }}>
                  <span className="badge badge-platinum" style={{ marginBottom: 16 }}>PLATINUM</span>
                  <div style={{ marginBottom: 24 }}>
                    <span className="bebas" style={{ fontSize: 52, color: "#E5E4E2" }}>$87</span>
                    <span style={{ fontSize: 24, color: "#E5E4E2" }}>.99</span>
                  </div>
                  <ul style={{ listStyle: "none", marginBottom: 32 }}>
                    {["✓ 8+ Styles complets", "✓ TOUS les Drum Kits", "✓ 3 VST inclus (Nexus, Serum, Omni)", "✓ 1 mois d'assistance", "✓ Masterclass exclusive"].map((f, i) => (
                      <li key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 14, color: "#ccc" }}>{f}</li>
                    ))}
                  </ul>
                  <button className="btn-outline" style={{ width: "100%", padding: 14, borderRadius: 8, fontSize: 14, borderColor: "#E5E4E250", color: "#E5E4E2" }} onClick={() => setShowRegisterModal("Platinum")}>S'inscrire →</button>
                </div>
              </div>
            </div>
          </section>

          {/* TOP 5 */}
          <section style={{ padding: "80px 24px" }}>
            <div style={{ maxWidth: 800, margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
                <div>
                  <span style={{ fontSize: 13, letterSpacing: 4, color: GOLD, fontWeight: 600 }}>CLASSEMENT</span>
                  <h2 className="bebas" style={{ fontSize: 52, color: "#fff" }}>TOP 5 ÉLÈVES</h2>
                </div>
                <span style={{ fontSize: 12, color: "#555" }}>Mis à jour chaque semaine</span>
              </div>
              {top5Edit.map((s, i) => (
                <div key={s.rank} className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 24px", marginBottom: 12 }}>
                  <span className={`rank-num ${i === 0 ? "top" : ""}`}>{s.rank}</span>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: i === 0 ? `${GOLD}22` : SURFACE2, border: `1px solid ${i === 0 ? GOLD : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: i === 0 ? GOLD : "#888" }}>
                    {s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</p>
                    <p style={{ fontSize: 12, color: "#888" }}>{s.style}</p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <p style={{ fontSize: 13, color: GOLD, fontWeight: 600, marginBottom: 6 }}>{s.beats} beats</p>
                    <div className="progress-bar" style={{ width: 120 }}><div className="progress-fill" style={{ width: `${s.progress}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "32px 24px", textAlign: "center" }}>
            <span className="bebas" style={{ fontSize: 24, color: GOLD }}>BIGSLAME ACADEMY</span>
            <p style={{ fontSize: 13, color: "#555", marginTop: 8 }}>© 2025 BigSlame — Tous droits réservés</p>
            <button onClick={() => setShowAdminCode(true)} style={{ background: "none", border: "none", cursor: "pointer", marginTop: 24, fontSize: 10, color: "#222", letterSpacing: 1, display: "block", margin: "24px auto 0" }}>·</button>
          </footer>
        </div>
      )}

      {/* STUDENT DASHBOARD */}
      {page === "dashboard" && loggedIn && !isAdmin && (
        <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <h2 className="bebas" style={{ fontSize: 40, color: "#fff" }}>MON ESPACE</h2>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span className="badge badge-gold">{currentUser.plan}</span>
                <span style={{ fontSize: 13, color: "#888" }}>• {currentUser.name}</span>
              </div>
            </div>
            <div style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30`, borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
              <p style={{ fontSize: 12, color: "#888" }}>Assistance restante</p>
              <p className="bebas" style={{ fontSize: 32, color: GOLD }}>18 JOURS</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {["resources", "upload", "chat"].map(tab => (
              <button key={tab} className={`tab-btn ${studentTab === tab ? "active" : ""}`} onClick={() => setStudentTab(tab)}>
                {tab === "resources" && "📦 Ressources"}
                {tab === "upload" && "🎵 Envoyer un beat"}
                {tab === "chat" && "💬 Chat BigSlame"}
              </button>
            ))}
          </div>

          {studentTab === "resources" && (
            <div>
              <div style={{ display: "grid", gap: 12 }}>
                {resources[currentUser.plan].map((r, i) => (
                  <div key={i} className="card2" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                    <span style={{ fontSize: 28 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</p>
                      <span className="badge" style={{ marginTop: 4, background: "#ffffff10", color: "#888", fontSize: 11 }}>{r.type.toUpperCase()}</span>
                    </div>
                    <button className="btn-gold" style={{ padding: "8px 20px", borderRadius: 6, fontSize: 13 }}>Télécharger</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {studentTab === "upload" && (
            <div>
              {currentUser.plan === "Silver" ? (
                <div className="card" style={{ padding: 40, textAlign: "center" }}>
                  <span style={{ fontSize: 48 }}>🔒</span>
                  <p style={{ color: "#888", marginTop: 16, fontSize: 15 }}>L'envoi de beats pour correction est disponible uniquement avec les packs <strong style={{ color: GOLD }}>Gold</strong> et <strong style={{ color: "#E5E4E2" }}>Platinum</strong>.</p>
                  <button className="btn-gold" style={{ padding: "12px 28px", borderRadius: 8, fontSize: 14, marginTop: 20 }} onClick={() => setShowRegisterModal("Gold")}>Upgrader vers Gold</button>
                </div>
              ) : (
                <>
                  <div className="upload-zone" onClick={() => notify("📁 Sélection de fichier simulée !")}>
                    <span style={{ fontSize: 48 }}>🎵</span>
                    <p style={{ color: "#888", marginTop: 12, fontSize: 15 }}>Glisse ton fichier ici ou clique pour sélectionner</p>
                    <p style={{ fontSize: 13, color: "#555", marginTop: 8 }}>Formats acceptés : .mp3, .wav — Max 100 MB</p>
                    <button className="btn-gold" style={{ padding: "10px 24px", borderRadius: 6, fontSize: 14, marginTop: 16 }}>Choisir un fichier</button>
                  </div>
                  <div style={{ marginTop: 24 }}>
                    <h4 style={{ color: "#888", fontSize: 13, marginBottom: 12, letterSpacing: 2 }}>BEATS ENVOYÉS (3)</h4>
                    {[{ name: "mon_drill_beat_v2.wav", date: "03/03", status: "Corrigé ✓" }, { name: "trap_experiment.mp3", date: "28/02", status: "En attente" }].map((f, i) => (
                      <div key={i} className="card2" style={{ display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8 }}>
                        <span style={{ marginRight: 12 }}>🎵</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14 }}>{f.name}</p>
                          <p style={{ fontSize: 12, color: "#555" }}>{f.date}</p>
                        </div>
                        <span className={`badge ${f.status.includes("Corrigé") ? "badge-green" : "badge-orange"}`}>{f.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {studentTab === "chat" && (
            <div className="card" style={{ display: "flex", flexDirection: "column", height: 500 }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${GOLD}22`, border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: GOLD }}>BS</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>BigSlame</p>
                  <p style={{ fontSize: 12, color: "#22c55e" }}>● En ligne</p>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                {messages.filter(m => m.from === "LilBeatz_237" || m.fromAdmin).map(msg => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.fromAdmin ? "flex-end" : "flex-start" }}>
                    <div>
                      <div className={`msg-bubble ${msg.fromAdmin ? "msg-admin" : "msg-user"}`}>{msg.text}</div>
                      <p style={{ fontSize: 11, color: "#444", marginTop: 4, textAlign: msg.fromAdmin ? "right" : "left" }}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10 }}>
                <input className="input" placeholder="Écris ton message..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMsg()} style={{ flex: 1 }} />
                <button className="btn-gold" style={{ padding: "10px 20px", borderRadius: 6, fontSize: 14 }} onClick={handleSendMsg}>Envoyer</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {page === "admin" && isAdmin && (
        <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <h2 className="bebas" style={{ fontSize: 40, color: "#fff" }}>ADMIN DASHBOARD</h2>
              <p style={{ color: "#888", fontSize: 14 }}>Bienvenue, BigSlame 👑</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[{ label: "Élèves actifs", val: students.filter(s => s.status === "active").length },
                { label: "En attente", val: students.filter(s => s.status === "pending").length },
                { label: "Revenus/mois", val: "$" + students.filter(s => s.validated).reduce((acc, s) => acc + (s.plan === "Silver" ? 21.99 : s.plan === "Gold" ? 47.99 : 87.99), 0).toFixed(0) }].map(m => (
                <div key={m.label} className="card2" style={{ padding: "12px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 12, color: "#888" }}>{m.label}</p>
                  <p className="bebas" style={{ fontSize: 28, color: GOLD }}>{m.val}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {["students", "messages", "beats", "top5"].map(tab => (
              <button key={tab} className={`tab-btn ${adminTab === tab ? "active" : ""}`} onClick={() => setAdminTab(tab)}>
                {tab === "students" && "👥 Élèves"}
                {tab === "messages" && "💬 Messages"}
                {tab === "beats" && "🎵 Poster un Beat"}
                {tab === "top5" && "🏆 Top 5"}
              </button>
            ))}
          </div>

          {adminTab === "students" && (
            <div>
              {students.filter(s => s.status === "pending").length > 0 && (
                <div style={{ background: "#f9731610", border: "1px solid #f9731630", borderRadius: 10, padding: 16, marginBottom: 20 }}>
                  <p style={{ color: "#f97316", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>⏳ {students.filter(s => s.status === "pending").length} inscription(s) en attente de validation</p>
                  {students.filter(s => s.status === "pending").map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, background: SURFACE2, borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f9731622", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#f97316" }}>{s.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</p>
                        <p style={{ fontSize: 12, color: "#888" }}>Pack {s.plan} — inscrit le {s.joined}</p>
                      </div>
                      <button className="btn-gold" style={{ padding: "8px 18px", borderRadius: 6, fontSize: 13 }} onClick={() => handleValidate(s.id)}>✓ Valider</button>
                    </div>
                  ))}
                </div>
              )}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Élève", "Pack", "Beats", "Statut", "Rejoint"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#555", letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.validated).map(s => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: GOLD }}>{s.avatar}</div>
                        <span style={{ fontSize: 14 }}>{s.name}</span>
                      </td>
                      <td style={{ padding: "12px" }}><span className={`badge badge-${s.plan.toLowerCase()}`}>{s.plan}</span></td>
                      <td style={{ padding: "12px", fontSize: 14 }}>{s.beats}</td>
                      <td style={{ padding: "12px" }}><span className="badge badge-green">Actif</span></td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#888" }}>{s.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {adminTab === "messages" && (
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, height: 520 }}>
              <div className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "16px", borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#888", letterSpacing: 1 }}>CONVERSATIONS</p>
                </div>
                {students.filter(s => s.validated).map(s => (
                  <div key={s.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", background: s.name === "LilBeatz_237" ? SURFACE2 : "transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: GOLD }}>{s.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: "#555" }} className="badge badge-" >{s.plan}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ fontWeight: 600 }}>LilBeatz_237</p>
                  <p style={{ fontSize: 12, color: "#888" }}>Pack Gold</p>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ display: "flex", justifyContent: msg.fromAdmin ? "flex-end" : "flex-start" }}>
                      <div>
                        <div className={`msg-bubble ${msg.fromAdmin ? "msg-admin" : "msg-user"}`}>{msg.text}</div>
                        <p style={{ fontSize: 11, color: "#444", marginTop: 4, textAlign: msg.fromAdmin ? "right" : "left" }}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10 }}>
                  <input className="input" placeholder="Répondre à LilBeatz_237..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSendMsg()} style={{ flex: 1 }} />
                  <button className="btn-gold" style={{ padding: "10px 20px", borderRadius: 6, fontSize: 14 }} onClick={handleSendMsg}>Envoyer</button>
                </div>
              </div>
            </div>
          )}

          {adminTab === "beats" && (
            <div style={{ maxWidth: 600 }}>
              <div className="card" style={{ padding: 28, marginBottom: 24 }}>
                <h3 style={{ color: GOLD, fontSize: 14, letterSpacing: 2, marginBottom: 20 }}>AJOUTER UN BEAT</h3>
                <div style={{ display: "grid", gap: 16 }}>
                  <div><label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Titre du beat</label><input className="input" placeholder="ex: Midnight Drill Vol.4" value={newBeatTitle} onChange={e => setNewBeatTitle(e.target.value)} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>BPM</label><input className="input" type="number" placeholder="140" /></div>
                    <div><label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Style</label><select className="input" style={{ background: SURFACE2 }}><option>Drill</option><option>Trap</option><option>Afrobeat</option><option>Autre</option></select></div>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: "#888", display: "block", marginBottom: 6 }}>Fichier audio</label>
                    <div className="upload-zone" style={{ padding: 20 }} onClick={() => notify("📁 Sélection simulée !")}>
                      <p style={{ color: "#888", fontSize: 14 }}>🎵 Déposer le fichier ici</p>
                      <p style={{ fontSize: 12, color: "#555" }}>.mp3 ou .wav</p>
                    </div>
                  </div>
                  <button className="btn-gold" style={{ padding: 14, borderRadius: 8, fontSize: 15 }} onClick={() => { if (newBeatTitle) { notify(`✅ Beat "${newBeatTitle}" publié !`); setNewBeatTitle(""); } else notify("⚠ Remplis le titre d'abord"); }}>Publier le beat</button>
                </div>
              </div>
              <h4 style={{ color: "#888", fontSize: 13, letterSpacing: 2, marginBottom: 12 }}>BEATS PUBLIÉS</h4>
              {mockBeats.map(b => (
                <div key={b.id} className="card2" style={{ display: "flex", alignItems: "center", padding: "12px 16px", marginBottom: 8 }}>
                  <span style={{ marginRight: 12 }}>🎵</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>{b.title}</p>
                    <p style={{ fontSize: 12, color: "#888" }}>{b.bpm} BPM • {b.style} • {b.plays.toLocaleString()} plays</p>
                  </div>
                  <button className="btn-outline" style={{ padding: "6px 12px", borderRadius: 6, fontSize: 12 }} onClick={() => notify("Beat supprimé")}>🗑</button>
                </div>
              ))}
            </div>
          )}

          {adminTab === "top5" && (
            <div style={{ maxWidth: 600 }}>
              <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Modifie manuellement le Top 5 de la semaine.</p>
              {top5Edit.map((s, i) => (
                <div key={s.rank} className="card2" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", marginBottom: 10 }}>
                  <span className="bebas" style={{ fontSize: 32, color: i === 0 ? GOLD : "#444", minWidth: 36 }}>#{s.rank}</span>
                  <input className="input" value={s.name} onChange={e => { const n = [...top5Edit]; n[i] = { ...n[i], name: e.target.value }; setTop5Edit(n); }} style={{ flex: 1 }} />
                  <input className="input" value={s.beats} type="number" onChange={e => { const n = [...top5Edit]; n[i] = { ...n[i], beats: parseInt(e.target.value) || 0, progress: Math.min(100, Math.round((parseInt(e.target.value) / 30) * 100)) }; setTop5Edit(n); }} style={{ width: 80 }} />
                  <span style={{ fontSize: 12, color: "#888" }}>beats</span>
                </div>
              ))}
              <button className="btn-gold" style={{ padding: "12px 32px", borderRadius: 8, fontSize: 14, marginTop: 8 }} onClick={() => notify("🏆 Top 5 mis à jour !")}>Sauvegarder le Top 5</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

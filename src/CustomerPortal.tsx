import { useState, type FormEvent } from "react";
import CustomerDashboard from "./CustomerDashboard";
import "./CustomerPortal.css";

export default function CustomerPortal() {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(true);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Member credentials are currently validated by the local portal flow.
    if (customerId.trim() === "atharva011" && password === "150207") {
      setError("");
      setLoggedIn(true);
    } else {
      setError("Member ID or password is incorrect. Please try again.");
    }
  }

  if (loggedIn) return <CustomerDashboard />;

  return (
    <main className="gt-login-page">
      <div className="gt-video-wall" aria-hidden="true">
        <video className="gt-login-video" autoPlay muted={muted} loop playsInline poster="https://images.pexels.com/photos/7915437/pexels-photo-7915437.jpeg?auto=compress&cs=tinysrgb&w=1920">
          <source src="https://videos.pexels.com/video-files/7914770/7914770-hd_1920_1080_25fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/7849217/7849217-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        <div className="gt-video-shade" />
        <div className="gt-video-grain" />
      </div>

      <header className="gt-login-topbar">
        <a className="gt-wordmark" href="#home" aria-label="Gamers Town home">
          <span className="gt-logo-symbol">GT</span>
          <span className="gt-wordmark-text">GAMERS<span>TOWN</span><small>PLAY. COMPETE. REPEAT.</small></span>
        </a>
        <div className="gt-live-pill"><i /> GAMING FLOOR ONLINE</div>
        <button className="gt-sound-toggle" type="button" onClick={() => setMuted(v => !v)} aria-label={muted ? "Unmute background video" : "Mute background video"}>
          {muted ? "◖×" : "◖))"} <span>{muted ? "SOUND OFF" : "SOUND ON"}</span>
        </button>
      </header>

      <section className="gt-login-stage">
        <div className="gt-login-copy">
          <div className="gt-kicker"><span /> YOUR NEXT MATCH STARTS HERE</div>
          <h1>ENTER THE<br/><em>ARENA.</em></h1>
          <p className="gt-login-intro">Your setup is waiting. Sign in to access your gaming time, wallet balance, and session details.</p>
          <div className="gt-feature-list">
            <div><span className="gt-feature-icon">01</span><p><b>YOUR SESSION</b><small>Check remaining play time live</small></p></div>
            <div><span className="gt-feature-icon">02</span><p><b>YOUR WALLET</b><small>Keep your gaming balance in view</small></p></div>
            <div><span className="gt-feature-icon">03</span><p><b>YOUR NEXT GAME</b><small>Get back into the action faster</small></p></div>
          </div>
          <div className="gt-game-tags"><span>VALORANT</span><span>CS2</span><span>GTA V</span><span>PC + CONSOLE</span></div>
        </div>

        <div className="gt-auth-column">
          <div className="gt-auth-card">
            <div className="gt-auth-card-head">
              <div className="gt-auth-brand">GT<span> / MEMBER ACCESS</span></div>
              <span className="gt-lock-mark">⌑</span>
            </div>
            <div className="gt-auth-title">Welcome back<span>.</span></div>
            <p className="gt-auth-subtitle">Sign in to continue your session.</p>
            <form onSubmit={handleLogin} className="gt-auth-form">
              <label htmlFor="customerId">CUSTOMER ID</label>
              <div className="gt-input-wrap"><span className="gt-input-icon">◎</span><input id="customerId" type="text" autoComplete="username" value={customerId} onChange={e=>setCustomerId(e.target.value)} placeholder="Enter your member ID" required /></div>
              <label htmlFor="customerPassword">PASSWORD</label>
              <div className="gt-input-wrap"><span className="gt-input-icon">⌑</span><input id="customerPassword" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required /><button type="button" className="gt-show-password" onClick={()=>setShowPassword(v=>!v)}>{showPassword ? "HIDE" : "SHOW"}</button></div>
              {error && <div role="alert" className="gt-login-error">{error}</div>}
              <button type="submit" className="gt-login-submit"><span>ENTER GAMING FLOOR</span><b>↗</b></button>
            </form>
            <div className="gt-auth-divider"><span/>SECURE MEMBER ACCESS<span/></div>
            <div className="gt-demo-note"><span>i</span><p><b>Member access</b><small>Use the member credentials issued to you at the venue counter.</small></p></div>
            <div className="gt-auth-foot"><span><i/> SYSTEM OPERATIONAL</span><span>GAMERS TOWN © 2026</span></div>
          </div>
          <div className="gt-seat-status"><span className="gt-seat-dot"/><div><b>READY WHEN YOU ARE</b><small>Your gaming session is managed at the counter.</small></div><span className="gt-seat-arrow">↗</span></div>
        </div>
      </section>
      <footer className="gt-login-footer"><span>BUILT FOR THE NEXT GENERATION OF PLAY</span><span>PLEASE VISIT THE COUNTER FOR BOOKINGS & TOP-UPS</span><span>01 / MEMBER PORTAL</span></footer>
    </main>
  );
}

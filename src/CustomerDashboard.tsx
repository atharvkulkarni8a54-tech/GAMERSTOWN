
import { useState } from "react";
import "./CustomerDashboard.css";

type Customer = {
  id: string;
  name: string;
  wallet: number;
  gamingMinutes: number;
  station: string;
  game: string;
};

const demoCustomer: Customer = {
  id: "GT-1024",
  name: "Alex",
  wallet: 450,
  gamingMinutes: 95,
  station: "PC-04",
  game: "VALORANT",
};

const availableGames = [
  "VALORANT",
  "Counter-Strike 2",
  "Grand Theft Auto V",
  "Cyberpunk 2077",
  "Call of Duty",
  "Steam",
  "Far Cry 6",
  "Red Dead Redemption 2",
];

type Tab = "Overview" | "My Gaming" | "Games" | "Wallet";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [customer] = useState<Customer>(demoCustomer);

  const hours = Math.floor(customer.gamingMinutes / 60);
  const minutes = customer.gamingMinutes % 60;

  const tabs: Tab[] = ["Overview", "My Gaming", "Games", "Wallet"];

  return (
    <div className="gt-customer-app">
      <aside className="gt-sidebar">
        <div className="gt-brand">
          <div className="gt-brand-icon">G</div>
          <div>
            <h2>GAMERS TOWN</h2>
            <span>PLAYER PORTAL</span>
          </div>
        </div>

        <div className="gt-player-card">
          <div className="gt-avatar">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="gt-player-info">
            <strong>{customer.name}</strong>
            <span>ID: {customer.id}</span>
          </div>
          <span className="gt-online-dot" />
        </div>

        <div className="gt-menu-label">PLAYER MENU</div>

        <nav className="gt-navigation">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`gt-nav-button ${
                activeTab === tab ? "gt-nav-active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="gt-nav-icon">
                {tab === "Overview"
                  ? "⌂"
                  : tab === "My Gaming"
                    ? "◷"
                    : tab === "Games"
                      ? "▣"
                      : "₹"}
              </span>
              {tab}
              {activeTab === tab && (
                <span className="gt-nav-indicator" />
              )}
            </button>
          ))}
        </nav>

        <div className="gt-help-card">
          <div className="gt-help-icon">i</div>
          <strong>Need assistance?</strong>
          <p>
            Visit the counter for food, drinks, extra gaming time or help
            with your session.
          </p>
        </div>

        <div className="gt-system-status">
          <span className="gt-online-dot" />
          Customer session active
        </div>
      </aside>

      <main className="gt-main">
        <header className="gt-header">
          <div>
            <div className="gt-breadcrumb">
              PLAYER PORTAL / {activeTab.toUpperCase()}
            </div>

            <h1>
              {activeTab === "Overview"
                ? `Welcome back, ${customer.name}`
                : activeTab}
            </h1>

            <p className="gt-header-subtitle">
              Your gaming session at GAMERS TOWN
            </p>
          </div>

          <div className="gt-header-right">
            <span className="gt-session-badge">
              <span className="gt-online-dot" />
              SESSION ACTIVE
            </span>

            <div className="gt-header-avatar">
              {customer.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {activeTab === "Overview" && (
          <>
            <section className="gt-hero">
              <div className="gt-hero-content">
                <span className="gt-hero-label">
                  YOUR NEXT MATCH STARTS HERE
                </span>
                <h2>GAME ON.</h2>
                <p>
                  Your station is assigned. Get ready to play.
                </p>

                <button
                  className="gt-primary-button"
                  onClick={() => setActiveTab("My Gaming")}
                >
                  View my session <span>→</span>
                </button>
              </div>

              <div className="gt-hero-decoration">GT</div>
              <div className="gt-hero-glow" />
            </section>

            <section className="gt-stats-grid">
              <article className="gt-stat-card gt-time-card">
                <div className="gt-stat-top">
                  <span className="gt-stat-label">TIME REMAINING</span>
                  <span className="gt-stat-icon">◷</span>
                </div>

                <div className="gt-stat-value">
                  {hours}<small>h</small> {minutes}<small>m</small>
                </div>

                <p>Gaming time available</p>
                <div className="gt-stat-line" />
              </article>

              <article className="gt-stat-card gt-wallet-card">
                <div className="gt-stat-top">
                  <span className="gt-stat-label">WALLET BALANCE</span>
                  <span className="gt-stat-icon">₹</span>
                </div>

                <div className="gt-stat-value">
                  ₹{customer.wallet.toLocaleString("en-IN")}
                </div>

                <p>Available wallet funds</p>
                <div className="gt-stat-line" />
              </article>

              <article className="gt-stat-card gt-station-card">
                <div className="gt-stat-top">
                  <span className="gt-stat-label">YOUR STATION</span>
                  <span className="gt-stat-icon">▣</span>
                </div>

                <div className="gt-stat-value gt-station-value">
                  {customer.station}
                </div>

                <p>Assigned gaming station</p>
                <div className="gt-stat-line" />
              </article>
            </section>

            <section className="gt-section">
              <div className="gt-section-heading">
                <div>
                  <h2>Your gaming session</h2>
                  <p>Details of your current session</p>
                </div>

                <span className="gt-active-tag">● ACTIVE</span>
              </div>

              <div className="gt-session-panel">
                <div className="gt-session-symbol">◷</div>

                <div className="gt-session-info">
                  <strong>{customer.station}</strong>
                  <span>Current assigned station</span>
                  <span className="gt-current-game">
                    Current game: {customer.game}
                  </span>
                </div>

                <div className="gt-session-time">
                  <span>TIME LEFT</span>
                  <strong>{hours}h {minutes}m</strong>
                </div>
              </div>
            </section>

            <section className="gt-section">
              <div className="gt-section-heading">
                <div>
                  <h2>Available games</h2>
                  <p>Games available at your gaming station</p>
                </div>

                <button
                  className="gt-text-button"
                  onClick={() => setActiveTab("Games")}
                >
                  View all →
                </button>
              </div>

              <div className="gt-games-grid">
                {availableGames.slice(0, 4).map((game, index) => (
                  <article className="gt-game-card" key={game}>
                    <div className="gt-game-top">
                      <span className="gt-game-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="gt-game-status">AVAILABLE</span>
                    </div>

                    <h3>{game}</h3>
                    <p>Available game</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="gt-counter-notice">
              <div className="gt-notice-icon">i</div>
              <div>
                <strong>Need food, drinks or more gaming time?</strong>
                <p>
                  Please visit the counter to place an order or purchase
                  additional gaming time. Ordering is not available from
                  this screen.
                </p>
              </div>
            </section>
          </>
        )}

        {activeTab === "My Gaming" && (
          <section className="gt-section gt-page-section">
            <div className="gt-section-heading">
              <div>
                <h2>My gaming session</h2>
                <p>Your current station and remaining time</p>
              </div>
              <span className="gt-active-tag">● ACTIVE</span>
            </div>

            <div className="gt-detail-panel">
              <span className="gt-stat-label">ASSIGNED STATION</span>
              <h2>{customer.station}</h2>

              <div className="gt-large-time">
                {hours}h {minutes}m
              </div>

              <p>Gaming time remaining</p>

              <div className="gt-detail-row">
                <span>Current game</span>
                <strong>{customer.game}</strong>
              </div>

              <div className="gt-detail-row">
                <span>Customer ID</span>
                <strong>{customer.id}</strong>
              </div>

              <div className="gt-detail-row">
                <span>Session status</span>
                <strong className="gt-green-text">Active</strong>
              </div>

              <div className="gt-notice-box">
                For extra time, account assistance or food and drinks,
                please visit the counter.
              </div>
            </div>
          </section>
        )}

        {activeTab === "Games" && (
          <section className="gt-section gt-page-section">
            <div className="gt-section-heading">
              <div>
                <h2>Available games</h2>
                <p>Browse the games listed for your station</p>
              </div>
            </div>

            <div className="gt-games-grid gt-all-games">
              {availableGames.map((game, index) => (
                <article className="gt-game-card" key={game}>
                  <div className="gt-game-top">
                    <span className="gt-game-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="gt-game-status">AVAILABLE</span>
                  </div>

                  <h3>{game}</h3>
                  <p>Available game</p>
                </article>
              ))}
            </div>

            <div className="gt-notice-box">
              This list is a demo. Actual game availability should be
              configured by the administrator.
            </div>
          </section>
        )}

        {activeTab === "Wallet" && (
          <section className="gt-section gt-page-section">
            <div className="gt-section-heading">
              <div>
                <h2>My wallet</h2>
                <p>View your available prepaid balance</p>
              </div>
            </div>

            <div className="gt-wallet-panel">
              <span>AVAILABLE BALANCE</span>
              <h2>₹{customer.wallet.toLocaleString("en-IN")}</h2>
              <p>Customer wallet · {customer.id}</p>

              <div className="gt-notice-box">
                <strong>Wallet services are handled at the counter.</strong>
                <p>
                  Visit the counter to add funds or pay for eligible
                  food and drink purchases. You cannot place orders or
                  make payments from this customer screen.
                </p>
              </div>
            </div>
          </section>
        )}

        <footer className="gt-footer">
          <span>GAMERS TOWN © 2026</span>
          <span>PLAY FAIR. PLAY HARD.</span>
        </footer>
      </main>
    </div>
  );
}

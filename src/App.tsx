
import { useState } from 'react'
import './App.css'

const initialStations = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `PC-${String(i + 1).padStart(2, '0')}`,
    type: 'Gaming PC',
    status: i < 12 ? 'In Session' : i < 15 ? 'Available' : 'Offline',
    customer: i < 12 ? ['Alex Morgan', 'Jordan Lee', 'Sam Wilson'][i % 3] : '',
    minutes: i < 12 ? 60 - i * 3 : 0,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `PS4-${String(i + 1).padStart(2, '0')}`,
    type: 'PlayStation 4',
    status: i === 0 ? 'In Session' : 'Available',
    customer: i === 0 ? 'Chris Parker' : '',
    minutes: i === 0 ? 35 : 0,
  })),
  {
    id: 'PS5-01',
    type: 'PlayStation 5',
    status: 'Available',
    customer: '',
    minutes: 0,
  },
]

const navigation = [
  ['Dashboard', '▦'],
  ['Gaming Stations', '▣'],
  ['Active Sessions', '◷'],
  ['Customers & CRM', '♙'],
  ['Memberships & Wallets', '◈'],
  ['POS & Food Menu', '▤'],
  ['Inventory Stock', '▥'],
  ['Invoices & Billing', '▧'],
  ['Expenses & Shifts', '₹'],
  ['Game Library', '⌘'],
  ['Reports & Analytics', '↗'],
  ['Security & Audit', '⬡'],
  ['Settings & Backup', '⚙'],
  ['Customer UI Preview', '▻'],
]

type Station = {
  id: string
  type: string
  status: string
  customer: string
  minutes: number
}

function App() {
  const [page, setPage] = useState('Dashboard')
  const [stations, setStations] = useState<Station[]>(initialStations)
  const [search, setSearch] = useState('')
  const [showSetup, setShowSetup] = useState(false)
  const [pcs, setPcs] = useState(20)
  const [ps4s, setPs4s] = useState(3)
  const [ps5s, setPs5s] = useState(1)
  const [notice, setNotice] = useState('')

  const active = stations.filter(s => s.status === 'In Session').length
  const available = stations.filter(s => s.status === 'Available').length
  const offline = stations.filter(s => s.status === 'Offline').length
  const visible = stations.filter(s =>
    `${s.id} ${s.type} ${s.status} ${s.customer}`.toLowerCase().includes(search.toLowerCase())
  )

  function configureStations() {
    const next: Station[] = [
      ...Array.from({ length: pcs }, (_, i) => ({
        id: `PC-${String(i + 1).padStart(2, '0')}`,
        type: 'Gaming PC',
        status: 'Available',
        customer: '',
        minutes: 0,
      })),
      ...Array.from({ length: ps4s }, (_, i) => ({
        id: `PS4-${String(i + 1).padStart(2, '0')}`,
        type: 'PlayStation 4',
        status: 'Available',
        customer: '',
        minutes: 0,
      })),
      ...Array.from({ length: ps5s }, (_, i) => ({
        id: `PS5-${String(i + 1).padStart(2, '0')}`,
        type: 'PlayStation 5',
        status: 'Available',
        customer: '',
        minutes: 0,
      })),
    ]
    setStations(next)
    setShowSetup(false)
    setNotice('Demo station setup updated successfully.')
  }

  function toggleDemo(id: string) {
    setStations(current => current.map(s => {
      if (s.id !== id) return s
      const start = s.status !== 'In Session'
      return {
        ...s,
        status: start ? 'In Session' : 'Available',
        customer: start ? 'Demo Customer' : '',
        minutes: start ? 60 : 0,
      }
    }))
    setNotice(`${id} updated in demo mode.`)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GT</div>
          <div><strong>GAMERS <span>TOWN</span></strong><small>GAMING LAB MANAGEMENT</small></div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <nav>
          {navigation.map(([name, icon]) => (
            <button key={name} className={`nav-item ${page === name ? 'selected' : ''}`}
              onClick={() => setPage(name)}>
              <span className="nav-icon">{icon}</span><span>{name}</span>
              {name === 'Gaming Stations' && <span className="nav-count">{stations.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="online-dot" /> DEMO ENVIRONMENT
          <small>Local prototype · Not production</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div><span className="eyebrow">GAMERS TOWN / MANAGEMENT</span><h1>{page}</h1></div>
          <div className="top-actions">
            <span className="live-pill"><i /> DEMO LIVE</span>
            <button className="button secondary" onClick={() => setPage('Customer UI Preview')}>Customer screen ↗</button>
            <div className="avatar">GT</div>
          </div>
        </header>

        <section className="content">
          {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}

          {page === 'Dashboard' && <>
            <div className="welcome-row">
              <div><h2>Command Center <span className="accent">●</span></h2><p>Your gaming floor at a glance. Welcome back, Admin.</p></div>
              <button className="button primary" onClick={() => setShowSetup(true)}>＋ Configure stations</button>
            </div>
            <div className="stats-grid">
              <Stat label="TOTAL STATIONS" value={stations.length} detail="Across all station types" icon="▣" />
              <Stat label="ACTIVE SESSIONS" value={active} detail="Currently in use" icon="◷" />
              <Stat label="AVAILABLE" value={available} detail="Ready for customers" icon="✓" />
              <Stat label="OFFLINE / IDLE" value={offline} detail="Demo status only" icon="⌁" />
            </div>
            <div className="section-heading"><div><h3>Gaming floor</h3><p>Station overview · Demo data</p></div><button className="button secondary" onClick={() => setPage('Gaming Stations')}>View all stations →</button></div>
            <div className="floor-grid">
              {stations.slice(0, 12).map(s => <StationCard key={s.id} station={s} onToggle={() => toggleDemo(s.id)} />)}
            </div>
            <div className="bottom-grid">
              <div className="panel"><h3>Quick actions</h3><div className="quick-actions">
                <button onClick={() => setPage('Active Sessions')}>◷ <span>Sessions</span></button>
                <button onClick={() => setPage('POS & Food Menu')}>▤ <span>POS & Menu</span></button>
                <button onClick={() => setPage('Customers & CRM')}>♙ <span>Customers</span></button>
                <button onClick={() => setPage('Reports & Analytics')}>↗ <span>Reports</span></button>
              </div></div>
              <div className="panel"><h3>System status</h3><div className="system-line"><span><i className="green-dot" /> UI prototype</span><strong>Running</strong></div><div className="system-line"><span><i className="yellow-dot" /> Database</span><strong>Not connected</strong></div><div className="system-line"><span><i className="yellow-dot" /> Station agents</span><strong>Not connected</strong></div></div>
            </div>
          </>}

          {page === 'Gaming Stations' && <>
            <div className="welcome-row"><div><h2>Station management</h2><p>Manage your demo PCs and consoles.</p></div><button className="button primary" onClick={() => setShowSetup(true)}>＋ Configure counts</button></div>
            <div className="search-row"><input placeholder="Search station, type, status or customer..." value={search} onChange={e => setSearch(e.target.value)} /><span>{visible.length} stations</span></div>
            <div className="station-list">{visible.map(s => <StationCard key={s.id} station={s} onToggle={() => toggleDemo(s.id)} />)}</div>
          </>}

          {page === 'Active Sessions' && <><div className="welcome-row"><div><h2>Active sessions</h2><p>Demo sessions only. No real timers or billing.</p></div></div><div className="station-list">{stations.filter(s => s.status === 'In Session').map(s => <StationCard key={s.id} station={s} onToggle={() => toggleDemo(s.id)} />)}</div>{active === 0 && <Empty text="No active demo sessions. Start one from Gaming Stations." />}</>}

          {page === 'Customer UI Preview' && <CustomerPreview onBack={() => setPage('Dashboard')} />}

          {!['Dashboard', 'Gaming Stations', 'Active Sessions', 'Customer UI Preview'].includes(page) && <div className="coming-soon"><div className="coming-icon">✦</div><h2>{page}</h2><p>This section is mapped in the prototype navigation.</p><p className="muted">The interactive demo currently includes Dashboard, Gaming Stations, Active Sessions and Customer UI Preview. This section will be built in the next prototype stage.</p><button className="button primary" onClick={() => setPage('Dashboard')}>← Back to dashboard</button></div>}
        </section>
        <footer>GAMERS TOWN <span>·</span> OWNER DEMO PROTOTYPE <span>·</span> NOT FOR LIVE BILLING</footer>
      </main>

      {showSetup && <div className="modal-backdrop" onClick={() => setShowSetup(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowSetup(false)}>×</button><span className="eyebrow">OWNER SETTINGS · DEMO</span><h2>Configure gaming floor</h2><p>Choose how many stations appear in this prototype. Saving replaces the current demo station list.</p>
        <NumberField label="Gaming PCs" value={pcs} setValue={setPcs} />
        <NumberField label="PlayStation 4" value={ps4s} setValue={setPs4s} />
        <NumberField label="PlayStation 5" value={ps5s} setValue={setPs5s} />
        <div className="modal-total">Total stations <strong>{pcs + ps4s + ps5s}</strong></div>
        <button className="button primary full" onClick={configureStations}>Save demo configuration</button>
      </div></div>}
    </div>
  )
}

function Stat({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><b>{icon}</b></div><div className="stat-value">{value}</div><p>{detail}</p></div>
}

function StationCard({ station, onToggle }: { station: Station; onToggle: () => void }) {
  const cls = station.status === 'In Session' ? 'busy' : station.status === 'Available' ? 'free' : 'offline'
  return <div className="station-card"><div className="station-top"><span className={`station-symbol ${cls}`}>▣</span><span className={`status-tag ${cls}`}>{station.status}</span></div><h4>{station.id}</h4><p>{station.type}</p><div className="station-divider" /><div className="station-bottom"><span>{station.customer || (station.status === 'Offline' ? 'Not connected' : 'Ready for player')}</span>{station.status === 'In Session' && <strong>{station.minutes}m</strong>}</div><button className="station-action" onClick={onToggle}>{station.status === 'In Session' ? 'End demo session −' : 'Start demo session +'}</button></div>
}

function NumberField({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><div><button onClick={() => setValue(Math.max(0, value - 1))}>−</button><strong>{value}</strong><button onClick={() => setValue(Math.min(200, value + 1))}>＋</button></div></label>
}

function Empty({ text }: { text: string }) { return <div className="empty-state">{text}</div> }

function CustomerPreview({ onBack }: { onBack: () => void }) {
  const [customerId, setCustomerId] = useState('')
  const [password, setPassword] = useState('')
  const [adminLoginOpen, setAdminLoginOpen] = useState(false)
  const [adminId, setAdminId] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  return (
    <div className="customer-preview">
      <button className="admin-corner-login" onClick={() => setAdminLoginOpen(true)}>
        Admin Login
      </button>

      {adminLoginOpen && (
        <div className="modal-backdrop" onClick={() => setAdminLoginOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setAdminLoginOpen(false)}>×</button>
            <span className="eyebrow">RESTRICTED ACCESS</span>
            <h2>Admin Login</h2>
            <p>Authorized administrators only.</p>
            <form onSubmit={e => {
              e.preventDefault()
              alert('Demo only: admin authentication is not connected yet.')
            }}>
              <label className="admin-field">Admin ID
                <input value={adminId} onChange={e => setAdminId(e.target.value)} required autoComplete="username" placeholder="Enter admin ID" />
              </label>
              <label className="admin-field">Password
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required autoComplete="current-password" placeholder="Enter admin password" />
              </label>
              <button className="button primary full" type="submit">Sign in securely →</button>
            </form>
          </div>
        </div>
      )}

      <div className="customer-brand">
        <div className="brand-mark">GT</div>
        <div><strong>GAMERS <span>TOWN</span></strong><small>YOUR GAME. YOUR ARENA.</small></div>
      </div>

      <div className="customer-center">
        <span className="eyebrow">WELCOME BACK TO YOUR ARENA</span>
        <h2>READY TO <span className="accent">PLAY?</span></h2>
        <p>Sign in with your GAMERS TOWN customer account.</p>

        <form className="login-card" onSubmit={e => {
          e.preventDefault()
          alert('Demo only: customer authentication is not connected yet.')
        }}>
          <div className="login-icon">GT</div>
          <h3>Customer Login</h3>
          <p>Enter your account credentials to continue.</p>
          <label htmlFor="customer-id">Customer ID</label>
          <input id="customer-id" value={customerId} onChange={e => setCustomerId(e.target.value)} required placeholder="Enter your customer ID" />
          <label htmlFor="customer-password">Password</label>
          <input id="customer-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" />
          <button type="button" className="forgot-password" onClick={() => alert('Demo only: password recovery will be connected later.')}>Forgot password?</button>
          <button className="button primary login-submit" type="submit">Sign in →</button>
        </form>

        <button className="button secondary" onClick={onBack}>← Return to admin demo</button>
      </div>

      <div className="customer-footer">PLAY HARD. PLAY FAIR. PLAY TOGETHER.</div>
    </div>
  )
}

export default App

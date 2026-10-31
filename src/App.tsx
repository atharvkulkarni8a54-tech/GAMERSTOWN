import { useCallback, useEffect, useMemo, useState } from 'react';
import FoodDrinkCatalog from "./components/FoodDrinkCatalog";
import DeviceFloorManager from "./components/DeviceFloorManager";
import { supabase } from './lib/supabase';
import './App.css';

type Device = { id: string; device_name: string; device_type: string; status: string };
type Package = { id: string; package_name: string; duration_minutes: number; weekday_price: number; weekend_price: number; active: boolean };
type Profile = { id: string; display_name: string; role: string };
type Category = { id: string; name: string; image: string; color: string };
type StockItem = { id: string; name: string; categoryId: string; quantity: number; unit: string; price: number; threshold: number; image: string };
const nav = ['Overview', 'Devices', 'Pricing', 'Customers', 'Sessions', 'Payments', 'Inventory', 'Settings'];
const money = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
const duration = (mins: number) => mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}m` : ''}` : `${mins}m`;
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const defaultCategories: Category[] = [
  { id: 'drinks', name: 'Drinks', image: '🥤', color: '#2e8eaa' },
  { id: 'snacks', name: 'Snacks', image: '🍟', color: '#bd8540' },
  { id: 'food', name: 'Food', image: '🍜', color: '#a66b50' },
];
const initialItems: StockItem[] = [
  { id: 'bottle', name: 'Water Bottle', categoryId: 'drinks', quantity: 40, unit: 'bottles', price: 20, threshold: 10, image: '💧' },
  { id: 'softdrink', name: 'Soft Drink', categoryId: 'drinks', quantity: 24, unit: 'cans / bottles', price: 40, threshold: 8, image: '🥤' },
  { id: 'chips', name: 'Chips', categoryId: 'snacks', quantity: 20, unit: 'packets', price: 30, threshold: 5, image: '🍟' },
  { id: 'noodles', name: 'Instant Noodles', categoryId: 'food', quantity: 15, unit: 'packs', price: 50, threshold: 5, image: '🍜' },
  { id: 'sandwich', name: 'Sandwich', categoryId: 'food', quantity: 10, unit: 'pieces', price: 80, threshold: 3, image: '🥪' },
];
function readSaved<T,>(key: string, fallback: T): T { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
function fileToData(file: File, done: (value: string) => void) { const reader = new FileReader(); reader.onload = () => done(String(reader.result)); reader.readAsDataURL(file); }

export default function App() {
  const [page, setPage] = useState('Overview');
  const [devices, setDevices] = useState<Device[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sessionsCount, setSessionsCount] = useState<number | null>(null);
  const [paymentsCount, setPaymentsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [categories, setCategories] = useState<Category[]>(() => readSaved('gt_inventory_categories_v1', defaultCategories));
  const [items, setItems] = useState<StockItem[]>(() => readSaved('gt_inventory_items_v1', initialItems));
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState({ name: '', image: '📦', color: '#5379d8' });
  const [itemDraft, setItemDraft] = useState({ name: '', categoryId: 'drinks', quantity: '0', unit: 'pieces', price: '', threshold: '5', image: '' });

  useEffect(() => { localStorage.setItem('gt_inventory_categories_v1', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('gt_inventory_items_v1', JSON.stringify(items)); }, [items]);

  const loadData = useCallback(async (initial = false) => {
    if (initial) setLoading(true); else setRefreshing(true);
    const problems: string[] = [];
    const [d, p, c, s, pay] = await Promise.all([
      supabase.from('devices').select('id, device_name, device_type, status').order('device_name'),
      supabase.from('pricing_packages').select('id, package_name, duration_minutes, weekday_price, weekend_price, active').eq('active', true).order('duration_minutes'),
      supabase.from('profiles').select('id, display_name, role').eq('role', 'customer'),
      supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ]);
    if (d.error) problems.push(`Devices: ${d.error.message}`); else setDevices(d.data ?? []);
    if (p.error) problems.push(`Pricing: ${p.error.message}`); else setPackages(p.data ?? []);
    if (c.error) problems.push(`Customers: ${c.error.message}`); else setProfiles(c.data ?? []);
    if (s.error) { problems.push(`Sessions: ${s.error.message}`); setSessionsCount(null); } else setSessionsCount(s.count ?? 0);
    if (pay.error) { problems.push(`Payments: ${pay.error.message}`); setPaymentsCount(null); } else setPaymentsCount(pay.count ?? 0);
    setErrors(problems); setLastUpdated(new Date().toLocaleTimeString('en-IN')); setLoading(false); setRefreshing(false);
  }, []);
  useEffect(() => { void loadData(true); }, [loadData]);
  const online = devices.filter(x => ['online', 'available'].includes(x.status.toLowerCase())).length;
  const occupied = devices.filter(x => ['occupied', 'in_use'].includes(x.status.toLowerCase())).length;
  const countType = (type: string) => devices.filter(x => x.device_type.toLowerCase() === type.toLowerCase()).length;
  const filteredItems = useMemo(() => items.filter(item => (activeCategory === 'all' || item.categoryId === activeCategory) && item.name.toLowerCase().includes(search.toLowerCase())), [items, activeCategory, search]);
  const lowStock = items.filter(item => item.quantity <= item.threshold).length;
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const resetItemForm = () => { setItemDraft({ name: '', categoryId: categories[0]?.id ?? '', quantity: '0', unit: 'pieces', price: '', threshold: '5', image: '' }); setEditingId(null); };
  const saveItem = () => {
    if (!itemDraft.name.trim() || !itemDraft.categoryId || Number(itemDraft.price) < 0 || Number(itemDraft.quantity) < 0) return;
    const record: StockItem = { id: editingId ?? uid(), name: itemDraft.name.trim(), categoryId: itemDraft.categoryId, quantity: Number(itemDraft.quantity), unit: itemDraft.unit.trim() || 'pieces', price: Number(itemDraft.price), threshold: Number(itemDraft.threshold) || 0, image: itemDraft.image || '📦' };
    setItems(current => editingId ? current.map(x => x.id === editingId ? record : x) : [record, ...current]); setShowItemForm(false); resetItemForm();
  };
  const editItem = (item: StockItem) => { setItemDraft({ name: item.name, categoryId: item.categoryId, quantity: String(item.quantity), unit: item.unit, price: String(item.price), threshold: String(item.threshold), image: item.image }); setEditingId(item.id); setShowItemForm(true); };
  const addCategory = () => {
    if (!categoryDraft.name.trim()) return;
    const name = categoryDraft.name.trim();
    if (editingCategoryId) setCategories(current => current.map(c => c.id === editingCategoryId ? { ...categoryDraft, id: c.id, name } : c));
    else setCategories(current => [...current, { ...categoryDraft, id: uid(), name }]);
    setCategoryDraft({ name: '', image: '📦', color: '#5379d8' }); setEditingCategoryId(null); setShowCategoryForm(false);
  };
  const editCategory = (cat: Category) => { setCategoryDraft({ name: cat.name, image: cat.image, color: cat.color }); setEditingCategoryId(cat.id); setShowCategoryForm(true); };
  const deleteCategory = (cat: Category) => {
    if (items.some(item => item.categoryId === cat.id)) { window.alert('Move or delete this category’s products before deleting the category.'); return; }
    if (!window.confirm(`Delete category “${cat.name}”?`)) return;
    setCategories(current => current.filter(c => c.id !== cat.id)); if (activeCategory === cat.id) setActiveCategory('all');
  };
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? 'Uncategorized';

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">GT</div><div><strong>GAMERS TOWN</strong><span>VENUE MANAGEMENT</span></div></div><div className="nav-label">MANAGEMENT</div><nav>{nav.map((item, i) => <button key={item} className={`nav-item ${page === item ? 'active' : ''}`} onClick={() => setPage(item)}><span>{['◈','▦','₹','◉','◷','⇄','▤'][i]}</span>{item}</button>)}</nav><div className="sidebar-bottom"><span className="status-dot" /> Database connection<small>Live venue records · local inventory workspace</small></div></aside>
    <main className="main-area">
      <header className="topbar"><div><div className="eyebrow">GAMING LAB / OPERATIONS</div><h1>{page}</h1></div><div className="admin-chip"><span className="admin-avatar">GT</span><div><strong>Venue administrator</strong><small>Operations workspace</small></div><button className="secondary-button" onClick={() => void loadData()} disabled={refreshing}>{refreshing ? 'Refreshing…' : '↻ Refresh'}</button></div></header>
      {errors.length > 0 && <section className="demo-warning" style={{ marginBottom: 18 }}><strong>Some database sections need administrator permissions.</strong><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></section>}
      {page === 'Overview' && <><section className="welcome-panel"><div><div className="eyebrow">OPERATIONS OVERVIEW</div><h2>Welcome to your gaming floor.</h2><p>Monitor registered stations, package pricing and daily operations from one workspace.</p></div><button className="primary-button" onClick={() => setPage('Devices')}>Manage devices →</button></section><section className="stats-grid"><Stat title="REGISTERED DEVICES" value={loading ? '…' : String(devices.length)} detail="Connected database records"/><Stat title="ONLINE / AVAILABLE" value={loading ? '…' : String(online)} detail="Based on device status"/><Stat title="OCCUPIED" value={loading ? '…' : String(occupied)} detail="Based on device status"/><Stat title="ACTIVE SESSIONS" value={sessionsCount === null ? '—' : String(sessionsCount)} detail="Live session records"/></section><div className="stats-grid compact-stats"><Stat title="CUSTOMER PROFILES" value={loading ? '…' : String(profiles.length)} detail="Registered customer profiles"/><Stat title="PAYMENT RECORDS" value={paymentsCount === null ? '—' : String(paymentsCount)} detail="Recorded transactions"/><Stat title="ACTIVE PACKAGES" value={loading ? '…' : String(packages.length)} detail="Available pricing packages"/></div><section className="section-heading"><div><h2>Device distribution</h2><p>Registered equipment by platform</p></div><button className="secondary-button" onClick={() => setPage('Devices')}>Manage devices →</button></section><div className="stats-grid compact-stats"><Stat title="GAMING PCs" value={String(countType('pc'))} detail="PC stations"/><Stat title="PLAYSTATION 4" value={String(countType('ps4'))} detail="Console stations"/><Stat title="PLAYSTATION 5" value={String(countType('ps5'))} detail="Console stations"/></div><p className="footer">Last synchronized: {lastUpdated || 'Connecting…'}</p></>}
      {page === 'Devices' && <DeviceFloorManager />}
      {page === 'Pricing' && <><section className="section-heading"><div><h2>Gaming packages</h2><p>Active package rates from your pricing table</p></div></section><div className="stats-grid">{packages.map(p => <div className="stat-card" key={p.id}><span className="stat-label">{p.package_name}</span><strong>{duration(p.duration_minutes)}</strong><p>Weekday {money(Number(p.weekday_price))} · Weekend {money(Number(p.weekend_price))}</p></div>)}</div>{packages.length === 0 && <div className="panel"><Empty text="No active packages are visible."/></div>}</>}
      {['Customers', 'Sessions', 'Payments'].includes(page) && <div className="panel"><h2>{page}</h2><p>Records are protected by your current database permissions. Secure admin access is required before showing customer or financial information here.</p></div>}
      {page === 'Settings' && <AdminSettings />}
      {page === 'Inventory' && <>
  <FoodDrinkCatalog />
  <section className="inventory-page">
        <div className="inventory-hero"><div><div className="eyebrow">STORE & COUNTER MANAGEMENT</div><h2>Inventory control</h2><p>Manage your products, categories, selling prices and stock levels.</p></div><button className="primary-button" onClick={() => { resetItemForm(); setShowItemForm(true); }}>＋ Add product</button></div>
        <div className="inventory-metrics"><div className="inventory-metric"><span>PRODUCTS</span><strong>{items.length}</strong><small>Items being tracked</small></div><div className="inventory-metric"><span>LOW STOCK</span><strong className={lowStock ? 'metric-warning' : ''}>{lowStock}</strong><small>At or below reorder level</small></div><div className="inventory-metric"><span>STOCK VALUE</span><strong>{money(totalValue)}</strong><small>Quantity × selling price</small></div><div className="inventory-metric"><span>CATEGORIES</span><strong>{categories.length}</strong><small>Custom product groups</small></div></div>
        <div className="inventory-section-head"><div><h3>Browse categories</h3><p>Select a category to filter products, or create your own.</p></div><button className="secondary-button" onClick={() => { setEditingCategoryId(null); setCategoryDraft({ name: '', image: '📦', color: '#5379d8' }); setShowCategoryForm(v => !v); }}>＋ New category</button></div>
        <div className="category-strip"><button className={`category-tile ${activeCategory === 'all' ? 'selected' : ''}`} onClick={() => setActiveCategory('all')}><span className="category-art all-art">▦</span><b>All products</b><small>{items.length} items</small></button>{categories.map(cat => <div key={cat.id} className={`category-tile-wrap ${activeCategory === cat.id ? 'selected' : ''}`}><button className={`category-tile ${activeCategory === cat.id ? 'selected' : ''}`} onClick={() => setActiveCategory(cat.id)}><span className="category-art" style={{ background: `${cat.color}24`, borderColor: `${cat.color}66` }}>{cat.image.startsWith('data:') ? <img src={cat.image} alt=""/> : cat.image}</span><b>{cat.name}</b><small>{items.filter(i => i.categoryId === cat.id).length} items</small></button><div className="category-tile-actions"><button onClick={() => editCategory(cat)}>Edit</button><button onClick={() => deleteCategory(cat)}>Delete</button></div></div>)}</div>
        {showCategoryForm && <div className="inventory-form-panel"><div className="inventory-form-title"><div><h3>{editingCategoryId ? 'Edit category' : 'Create category'}</h3><p>Choose a name, image and accent colour for quick counter identification.</p></div><button className="icon-close" onClick={() => { setShowCategoryForm(false); setEditingCategoryId(null); }}>×</button></div><div className="category-create-row"><label className="field"><span>Category name</span><input value={categoryDraft.name} onChange={e => setCategoryDraft({ ...categoryDraft, name: e.target.value })} placeholder="e.g. Energy drinks"/></label><label className="field"><span>Category icon / emoji</span><input value={categoryDraft.image} onChange={e => setCategoryDraft({ ...categoryDraft, image: e.target.value })} maxLength={8}/></label><label className="field"><span>Accent color</span><input type="color" value={categoryDraft.color} onChange={e => setCategoryDraft({ ...categoryDraft, color: e.target.value })}/></label><label className="field"><span>Category photo</span><input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) fileToData(file, image => setCategoryDraft(d => ({ ...d, image }))); }}/></label><button className="primary-button" onClick={addCategory}>{editingCategoryId ? 'Save category' : 'Create category'}</button></div></div>}
        {showItemForm && <div className="inventory-form-panel"><div className="inventory-form-title"><div><h3>{editingId ? 'Edit product' : 'Add a product'}</h3><p>Enter the details used by your counter team to track stock.</p></div><button className="icon-close" onClick={() => { setShowItemForm(false); resetItemForm(); }}>×</button></div><div className="product-form-grid"><label className="field"><span>Product name</span><input value={itemDraft.name} onChange={e => setItemDraft({ ...itemDraft, name: e.target.value })} placeholder="e.g. Bottled water"/></label><label className="field"><span>Category</span><select value={itemDraft.categoryId} onChange={e => setItemDraft({ ...itemDraft, categoryId: e.target.value })}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className="field"><span>Quantity in stock</span><input type="number" min="0" value={itemDraft.quantity} onChange={e => setItemDraft({ ...itemDraft, quantity: e.target.value })}/></label><label className="field"><span>Unit</span><input value={itemDraft.unit} onChange={e => setItemDraft({ ...itemDraft, unit: e.target.value })} placeholder="bottles, packets, pieces"/></label><label className="field"><span>Selling price (₹)</span><input type="number" min="0" value={itemDraft.price} onChange={e => setItemDraft({ ...itemDraft, price: e.target.value })} placeholder="0"/></label><label className="field"><span>Reorder threshold</span><input type="number" min="0" value={itemDraft.threshold} onChange={e => setItemDraft({ ...itemDraft, threshold: e.target.value })}/></label><label className="field product-photo-field"><span>Product photo</span><div className="photo-upload"><div className="photo-preview">{itemDraft.image.startsWith('data:') ? <img src={itemDraft.image} alt="Product preview"/> : itemDraft.image || '📦'}</div><div><input type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file) fileToData(file, image => setItemDraft(d => ({ ...d, image }))); }}/><small>Upload a photo for quick visual identification.</small></div></div></label></div><div className="form-actions"><button className="secondary-button" onClick={() => { setShowItemForm(false); resetItemForm(); }}>Cancel</button><button className="primary-button" onClick={saveItem}>{editingId ? 'Save changes' : 'Add product'}</button></div></div>}
        <div className="inventory-section-head product-list-head"><div><h3>{activeCategory === 'all' ? 'All products' : categoryName(activeCategory)}</h3><p>{filteredItems.length} products · Manage quantities and pricing</p></div><input className="inventory-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"/></div>
        <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>IN STOCK</th><th>SELLING PRICE</th><th>REORDER AT</th><th>STATUS</th><th></th></tr></thead><tbody>{filteredItems.map(item => <tr key={item.id}><td><div className="product-cell"><span className="product-thumb">{item.image.startsWith('data:') ? <img src={item.image} alt=""/> : item.image}</span><strong>{item.name}</strong></div></td><td><span className="category-pill">{categoryName(item.categoryId)}</span></td><td><strong>{item.quantity}</strong> <span className="unit-text">{item.unit}</span></td><td className="price-cell">{money(item.price)}</td><td>{item.threshold} <span className="unit-text">{item.unit}</span></td><td><span className={`stock-status ${item.quantity <= item.threshold ? 'low' : 'healthy'}`}>{item.quantity <= item.threshold ? 'LOW STOCK' : 'IN STOCK'}</span></td><td><div className="table-actions"><button onClick={() => editItem(item)} title="Edit product">Edit</button><button className="delete-action" onClick={() => setItems(current => current.filter(x => x.id !== item.id))} title="Delete product">Delete</button></div></td></tr>)}</tbody></table>{filteredItems.length === 0 && <Empty text="No products found. Add a product or choose another category."/>}</div>
        <p className="inventory-footnote">Inventory is currently stored locally in this browser. To share stock changes across counter terminals, connect a dedicated inventory table with secure staff permissions.</p>
      </section>
</>}
    </main>
  </div>;
}
function Stat({ title, value, detail }: { title: string; value: string; detail: string }) { return <div className="stat-card"><span className="stat-label">{title}</span><strong>{value}</strong><p>{detail}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="empty-state"><div className="empty-icon">▦</div><strong>{text}</strong></div>; }

type VenueSettings = {
  venueName: string; venueTagline: string; adminLabel: string; accent: string;
  weekdayStart: string; weekdayEnd: string; weekendStart: string; weekendEnd: string;
  prepaidValidityMonths: number; allowResume: boolean; maintenanceMessage: string;
  pcCount: number; ps4Count: number; ps5Count: number; stationAutoStart: boolean;
};
const defaultVenueSettings: VenueSettings = {
  venueName: 'GAMERS TOWN', venueTagline: 'VENUE MANAGEMENT', adminLabel: 'Venue administrator', accent: '#5b8cff',
  weekdayStart: '10:00', weekdayEnd: '23:00', weekendStart: '09:00', weekendEnd: '00:00',
  prepaidValidityMonths: 6, allowResume: true, maintenanceMessage: 'This station is temporarily unavailable.',
  pcCount: 20, ps4Count: 3, ps5Count: 1, stationAutoStart: true,
};
function AdminSettings() {
  const [settings, setSettings] = useState<VenueSettings>(() => readSaved('gt_venue_settings_v1', defaultVenueSettings));
  const [saved, setSaved] = useState(false);
  const update = <K extends keyof VenueSettings>(key: K, value: VenueSettings[K]) => { setSettings(old => ({ ...old, [key]: value })); setSaved(false); };
  const save = () => { localStorage.setItem('gt_venue_settings_v1', JSON.stringify(settings)); setSaved(true); };
  const reset = () => { if (window.confirm('Reset these settings to the demo defaults?')) { setSettings(defaultVenueSettings); localStorage.setItem('gt_venue_settings_v1', JSON.stringify(defaultVenueSettings)); setSaved(true); } };
  return <section className="settings-page">
    <div className="inventory-hero"><div><div className="eyebrow">OWNER CONTROL CENTRE</div><h2>Venue settings</h2><p>Customize the venue profile, operating rules and station defaults. Changes are saved in this browser for the frontend demo.</p></div><span className="settings-preview-mark" style={{background:settings.accent}}>GT</span></div>
    <div className="demo-warning"><strong>Frontend demo settings</strong><p>These controls currently save locally in this browser. They will become shared venue-wide settings after the database and backend are connected.</p></div>
    <div className="settings-grid">
      <section className="panel settings-card"><div className="settings-card-heading"><span>01</span><div><h3>Venue profile</h3><p>Identity shown across the management system.</p></div></div>
        <label className="field"><span>Venue name</span><input value={settings.venueName} onChange={e=>update('venueName',e.target.value)} /></label>
        <label className="field"><span>Venue tagline</span><input value={settings.venueTagline} onChange={e=>update('venueTagline',e.target.value)} /></label>
        <label className="field"><span>Administrator display name</span><input value={settings.adminLabel} onChange={e=>update('adminLabel',e.target.value)} /></label>
      </section>
      <section className="panel settings-card"><div className="settings-card-heading"><span>02</span><div><h3>Appearance</h3><p>Choose the accent colour used by the admin interface.</p></div></div>
        <label className="field"><span>Accent colour</span><div className="settings-color-row"><input type="color" value={settings.accent} onChange={e=>update('accent',e.target.value)} /><strong>{settings.accent.toUpperCase()}</strong></div></label>
        <div className="settings-live-preview" style={{borderColor:settings.accent}}><span className="settings-preview-mark" style={{background:settings.accent}}>GT</span><div><strong>{settings.venueName || 'Your venue'}</strong><small>{settings.venueTagline || 'Your tagline'}</small></div></div>
      </section>
      <section className="panel settings-card"><div className="settings-card-heading"><span>03</span><div><h3>Operating hours</h3><p>Set the venue's regular opening and closing times.</p></div></div>
        <div className="form-grid"><label className="field"><span>Weekday opens</span><input type="time" value={settings.weekdayStart} onChange={e=>update('weekdayStart',e.target.value)} /></label><label className="field"><span>Weekday closes</span><input type="time" value={settings.weekdayEnd} onChange={e=>update('weekdayEnd',e.target.value)} /></label><label className="field"><span>Weekend opens</span><input type="time" value={settings.weekendStart} onChange={e=>update('weekendStart',e.target.value)} /></label><label className="field"><span>Weekend closes</span><input type="time" value={settings.weekendEnd} onChange={e=>update('weekendEnd',e.target.value)} /></label></div>
      </section>
      <section className="panel settings-card"><div className="settings-card-heading"><span>04</span><div><h3>Session rules</h3><p>Defaults for prepaid customer time.</p></div></div>
        <label className="field"><span>Prepaid time validity (months)</span><input type="number" min="1" max="24" value={settings.prepaidValidityMonths} onChange={e=>update('prepaidValidityMonths',Math.max(1,Number(e.target.value)))} /></label>
        <label className="settings-toggle"><span><strong>Allow unused time to resume</strong><small>Customers can continue remaining prepaid time on a later visit.</small></span><input type="checkbox" checked={settings.allowResume} onChange={e=>update('allowResume',e.target.checked)} /></label>
      </section>
      <section className="panel settings-card"><div className="settings-card-heading"><span>05</span><div><h3>Station defaults</h3><p>Expected device quantities for the venue plan.</p></div></div>
        <div className="form-grid"><label className="field"><span>Gaming PCs</span><input type="number" min="0" value={settings.pcCount} onChange={e=>update('pcCount',Math.max(0,Number(e.target.value)))} /></label><label className="field"><span>PlayStation 4</span><input type="number" min="0" value={settings.ps4Count} onChange={e=>update('ps4Count',Math.max(0,Number(e.target.value)))} /></label><label className="field"><span>PlayStation 5</span><input type="number" min="0" value={settings.ps5Count} onChange={e=>update('ps5Count',Math.max(0,Number(e.target.value)))} /></label></div>
        <label className="settings-toggle"><span><strong>Station app starts with Windows</strong><small>Desired behaviour for the future Windows station client.</small></span><input type="checkbox" checked={settings.stationAutoStart} onChange={e=>update('stationAutoStart',e.target.checked)} /></label>
      </section>
      <section className="panel settings-card"><div className="settings-card-heading"><span>06</span><div><h3>Station messages</h3><p>Text displayed when a station is unavailable.</p></div></div>
        <label className="field"><span>Maintenance message</span><textarea rows={3} value={settings.maintenanceMessage} onChange={e=>update('maintenanceMessage',e.target.value)} /></label>
      </section>
    </div>
    <div className="settings-actions"><button className="secondary-button" onClick={reset}>Reset demo defaults</button><button className="primary-button" onClick={save}>Save settings</button></div>
    {saved && <div className="notice">Settings saved in this browser.</div>}
  </section>;
}

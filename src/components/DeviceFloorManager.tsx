
import { useState } from "react";
import "./DeviceFloorManager.css";

type Status = "free" | "playing" | "maintenance";
type Device = {
  id: string;
  number: number;
  name: string;
  type: "PC" | "PS4" | "PS5";
  status: Status;
  customer?: string;
  startedAt?: string;
  package?: string;
};

const createDevices = (): Device[] => [
  { id: "GF-PS4", number: 1, name: "PS4", type: "PS4", status: "free" },
  { id: "GF-PS5", number: 2, name: "PS5", type: "PS5", status: "free" },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `P1-PC-${i + 1}`,
    number: i + 1,
    name: `PC ${i + 1}`,
    type: "PC" as const,
    status: "free" as const,
  })),
  ...Array.from({ length: 11 }, (_, i) => ({
    id: `P2-PC-${i + 1}`,
    number: i + 10,
    name: `PC ${i + 10}`,
    type: "PC" as const,
    status: "free" as const,
  })),
];

const floors = [
  { id: "GF", title: "Ground Floor", subtitle: "Console Gaming", ids: ["GF-PS4", "GF-PS5"] },
  { id: "P1", title: "Part 1", subtitle: "9 Gaming PCs", ids: Array.from({ length: 9 }, (_, i) => `P1-PC-${i + 1}`) },
  { id: "P2", title: "Part 2", subtitle: "11 Gaming PCs", ids: Array.from({ length: 11 }, (_, i) => `P2-PC-${i + 1}`) },
];

export default function DeviceFloorManager() {
  const [devices, setDevices] = useState<Device[]>(createDevices);
  const [selected, setSelected] = useState<Device | null>(null);

  const updateDevice = (id: string, status: Status) => {
    setDevices(current =>
      current.map(device =>
        device.id === id
          ? {
              ...device,
              status,
              customer: status === "playing" ? device.customer || "" : undefined,
              startedAt: status === "playing" ? device.startedAt || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : undefined,
            }
          : device
      )
    );
    setSelected(current =>
      current?.id === id
        ? {
            ...current,
            status,
            customer: status === "playing" ? current.customer || "" : undefined,
            startedAt: status === "playing" ? current.startedAt || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : undefined,
          }
        : current
    );
  };

  const updateCustomer = (id: string, customer: string) => {
    setDevices(current => current.map(d => d.id === id ? { ...d, customer } : d));
    setSelected(current => current?.id === id ? { ...current, customer } : current);
  };

  const totals = {
    free: devices.filter(d => d.status === "free").length,
    playing: devices.filter(d => d.status === "playing").length,
    maintenance: devices.filter(d => d.status === "maintenance").length,
  };

  return (
    <div className="floor-manager">
      <header className="fm-header">
        <div>
          <span className="fm-eyebrow">GAMING FLOOR / LIVE MONITOR</span>
          <h2>Device Management</h2>
          <p>Monitor and manage all gaming stations across your venue.</p>
        </div>
        <div className="fm-total">{devices.length}<small>Total stations</small></div>
      </header>

      <div className="fm-summary">
        <div className="fm-summary-card">
          <span className="fm-dot free" />
          <div><strong>{totals.free}</strong><small>Available</small></div>
        </div>
        <div className="fm-summary-card">
          <span className="fm-dot playing" />
          <div><strong>{totals.playing}</strong><small>Playing</small></div>
        </div>
        <div className="fm-summary-card">
          <span className="fm-dot maintenance" />
          <div><strong>{totals.maintenance}</strong><small>Maintenance</small></div>
        </div>
      </div>

      <div className="fm-legend">
        <span><i className="fm-dot free" /> Available</span>
        <span><i className="fm-dot playing" /> Playing</span>
        <span><i className="fm-dot maintenance" /> Maintenance</span>
      </div>

      {floors.map(floor => {
        const floorDevices = floor.ids
          .map(id => devices.find(device => device.id === id))
          .filter((device): device is Device => Boolean(device));

        return (
          <section className="fm-floor" key={floor.id}>
            <div className="fm-floor-heading">
              <div>
                <h3>{floor.title}</h3>
                <p>{floor.subtitle}</p>
              </div>
              <span>{floorDevices.length} STATIONS</span>
            </div>

            <div className="fm-room">
              <div className="fm-room-label">{floor.id === "GF" ? "CONSOLE AREA" : "PC GAMING AREA"}</div>
              <div className="fm-device-grid">
                {floorDevices.map(device => (
                  <button
                    type="button"
                    key={device.id}
                    className={`fm-device ${device.status}`}
                    title={`${device.name} · ${device.status}`}
                    onClick={() => setSelected(device)}
                  >
                    <span className={`fm-device-dot ${device.status}`}>
                      {device.number}
                    </span>
                    <small>{device.name}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {selected && (
        <div className="fm-overlay" onClick={() => setSelected(null)}>
          <div className="fm-modal" onClick={event => event.stopPropagation()}>
            <button className="fm-close" onClick={() => setSelected(null)}>×</button>
            <span className="fm-eyebrow">DEVICE INFORMATION</span>
            <h2>{selected.name}</h2>
            <p className="fm-device-id">{selected.id}</p>

            <div className="fm-detail">
              <span>Current status</span>
              <strong><i className={`fm-dot ${selected.status}`} />{selected.status.toUpperCase()}</strong>
            </div>
            <div className="fm-detail">
              <span>Device type</span><strong>{selected.type}</strong>
            </div>
            <div className="fm-detail">
              <span>Customer</span><strong>{selected.customer || "No customer assigned"}</strong>
            </div>
            <div className="fm-detail">
              <span>Playing since</span><strong>{selected.startedAt || "—"}</strong>
            </div>
            <div className="fm-detail">
              <span>Package</span><strong>{selected.package || "—"}</strong>
            </div>

            {selected.status === "playing" && (
              <label className="fm-customer-field">
                Customer name
                <input
                  value={selected.customer || ""}
                  onChange={event => updateCustomer(selected.id, event.target.value)}
                  placeholder="Enter customer name"
                />
              </label>
            )}

            <div className="fm-status-title">Change station status</div>
            <div className="fm-actions">
              <button onClick={() => updateDevice(selected.id, "free")}>Available</button>
              <button onClick={() => updateDevice(selected.id, "playing")}>Playing</button>
              <button onClick={() => updateDevice(selected.id, "maintenance")}>Maintenance</button>
            </div>
            <p className="fm-note">Status changes are currently local to this browser. Live session integration comes next.</p>
          </div>
        </div>
      )}
    </div>
  );
}


import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./App.css";

type Customer = {
  id: string;
  name: string;
  wallet: number;
  gamingMinutes: number;
};

type Station = {
  id: string;
  type: "PC" | "PS4" | "PS5";
  customerId: string | null;
  game: string;
  sessionMinutes: number;
  running: boolean;
};

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  lowStockAt: number;
};

type Transaction = {
  id: number;
  customerId: string;
  type: "Gaming time" | "Wallet top-up" | "Food & Drinks";
  amount: number;
  minutes: number;
  payment: string;
  date: string;
};

const initialCustomers: Customer[] = [
  { id: "GT-1001", name: "Aarav Sharma", wallet: 500, gamingMinutes: 180 },
  { id: "GT-1002", name: "Rohan Patil", wallet: 250, gamingMinutes: 90 },
  { id: "GT-1003", name: "Aditya Joshi", wallet: 100, gamingMinutes: 240 },
  { id: "GT-1004", name: "Vihaan Deshmukh", wallet: 0, gamingMinutes: 60 },
];

const initialStations: Station[] = [
  ...Array.from({ length: 20 }, (_, i) => ({
    id: `PC-${String(i + 1).padStart(2, "0")}`,
    type: "PC" as const,
    customerId: null,
    game: "",
    sessionMinutes: 0,
    running: false,
  })),
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `PS4-${String(i + 1).padStart(2, "0")}`,
    type: "PS4" as const,
    customerId: null,
    game: "",
    sessionMinutes: 0,
    running: false,
  })),
  {
    id: "PS5-01",
    type: "PS5" as const,
    customerId: null,
    game: "",
    sessionMinutes: 0,
    running: false,
  },
];

const initialGames = [
  "Valorant",
  "Counter-Strike 2",
  "Steam",
  "GTA V",
  "Cyberpunk 2077",
];

const initialInventory: InventoryItem[] = [
  { id: 1, name: "Water Bottle", category: "Drinks", quantity: 40, unit: "bottles", price: 20, lowStockAt: 10 },
  { id: 2, name: "Soft Drink", category: "Drinks", quantity: 24, unit: "cans/bottles", price: 40, lowStockAt: 8 },
  { id: 3, name: "Chips", category: "Snacks", quantity: 20, unit: "packets", price: 30, lowStockAt: 5 },
  { id: 4, name: "Instant Noodles", category: "Food", quantity: 15, unit: "packs", price: 50, lowStockAt: 5 },
  { id: 5, name: "Sandwich", category: "Food", quantity: 10, unit: "pieces", price: 80, lowStockAt: 3 },
];

function money(value: number) {
  return `₹${value.toFixed(2)}`;
}

function duration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [customers, setCustomers] = useState(initialCustomers);
  const [stations, setStations] = useState(initialStations);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
 const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const [stockName, setStockName] = useState("");
  const [stockCategory, setStockCategory] = useState("Snacks");
  const [stockQuantity, setStockQuantity] = useState("10");
  const [stockUnit, setStockUnit] = useState("pieces");
  const [stockPrice, setStockPrice] = useState("30");
  const [stockLowAt, setStockLowAt] = useState("5");
  const [restockItemId, setRestockItemId] = useState("1");
  const [restockQuantity, setRestockQuantity] = useState("10");

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("GT-1001");
  const [customerIdLookup, setCustomerIdLookup] = useState("");
  const [verifiedCustomerId, setVerifiedCustomerId] = useState("");
  const [foodItem, setFoodItem] = useState("Water Bottle");
  const [foodQuantity, setFoodQuantity] = useState("1");
  const [minutes, setMinutes] = useState("60");
  const [walletAmount, setWalletAmount] = useState("200");
  const [hourlyRate, setHourlyRate] = useState("100");
  const [payment, setPayment] = useState("Cash");
  const [stationId, setStationId] = useState("PC-01");
  const [game, setGame] = useState("Valorant");
  const [notice, setNotice] = useState("");

  const selectedCustomer = customers.find((c) => c.id === selectedId);

  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) =>
          c.id.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [customers, search],
  );

  const activeStations = stations.filter((s) => s.customerId !== null).length;
  const totalWallet = customers.reduce((sum, c) => sum + c.wallet, 0);
  const totalGamingMinutes = customers.reduce((sum, c) => sum + c.gamingMinutes, 0);
  const lowStockCount = inventory.filter((item) => item.quantity <= item.lowStockAt).length;
  const inventoryValue = inventory.reduce((sum, item) => sum + item.quantity * item.price, 0);

  function updateCustomer(customerId: string, update: Partial<Customer>) {
    setCustomers((previous) =>
      previous.map((c) => (c.id === customerId ? { ...c, ...update } : c)),
    );
  }

  function addTransaction(
    customerId: string,
    type: Transaction["type"],
    amount: number,
    addedMinutes: number,
  ) {
    setTransactions((previous) => [
      {
        id: Date.now(),
        customerId,
        type,
        amount,
        minutes: addedMinutes,
        payment,
        date: new Date().toLocaleString("en-IN"),
      },
      ...previous,
    ]);
  }

  function addGamingTime() {
    const customer = customers.find((c) => c.id === selectedId);
    const mins = Number(minutes);
    const rate = Number(hourlyRate);

    if (!customer) return setNotice("Select a valid customer first.");
    if (!Number.isInteger(mins) || mins <= 0) {
      return setNotice("Enter a positive whole number of minutes.");
    }
    if (!Number.isFinite(rate) || rate < 0) {
      return setNotice("Enter a valid hourly rate.");
    }

    const charge = (mins / 60) * rate;

    updateCustomer(customer.id, {
      gamingMinutes: customer.gamingMinutes + mins,
    });

    addTransaction(customer.id, "Gaming time", charge, mins);

    setNotice(
      `Added ${mins} gaming minutes to ${customer.name}. Estimated charge: ${money(charge)}. This is a demo record.`,
    );
  }

  function addWalletMoney() {
    const customer = customers.find((c) => c.id === selectedId);
    const amount = Number(walletAmount);

    if (!customer) return setNotice("Select a valid customer first.");
    if (!Number.isFinite(amount) || amount <= 0) {
      return setNotice("Enter an amount greater than ₹0.");
    }

    updateCustomer(customer.id, { wallet: customer.wallet + amount });
    addTransaction(customer.id, "Wallet top-up", amount, 0);

    setNotice(
      `Added ${money(amount)} to ${customer.name}'s wallet. This is a demo record.`,
    );
  }

  function findCustomerById() {
    const id = customerIdLookup.trim().toUpperCase();
    const customer = customers.find((c) => c.id.toUpperCase() === id);

    if (!customer) {
      setVerifiedCustomerId("");
      return setNotice("Customer ID not found. Check the ID and try again.");
    }

    setSelectedId(customer.id);
    setVerifiedCustomerId(customer.id);
    setSearch("");

    setNotice(
      `Customer ${customer.id} loaded. You can manage time, wallet and food/drinks below.`,
    );
  }

  function addFoodDrink() {
    const customer = customers.find((c) => c.id === verifiedCustomerId);
    const item = inventory.find((x) => x.name === foodItem);
    const qty = Number(foodQuantity);

    if (!customer) return setNotice("Enter and verify a Customer ID first.");
    if (!item) return setNotice("Select a valid food or drink item.");
    if (!Number.isInteger(qty) || qty < 1) {
      return setNotice("Quantity must be a positive whole number.");
    }

    const total = item.price * qty;

    if (item.quantity < qty) {
      return setNotice(
        `Not enough ${item.name} in stock. Available: ${item.quantity} ${item.unit}.`,
      );
    }

    if (customer.wallet < total) {
      return setNotice(
        `Insufficient wallet balance. ${money(total)} required; ${money(customer.wallet)} available.`,
      );
    }

    updateCustomer(customer.id, { wallet: customer.wallet - total });

    setInventory((previous) =>
      previous.map((stock) =>
        stock.id === item.id
          ? { ...stock, quantity: stock.quantity - qty }
          : stock,
      ),
    );

    addTransaction(customer.id, "Food & Drinks", total, 0);

    setNotice(
      `${qty} × ${item.name} sold to ${customer.name}. ${money(total)} deducted from wallet and stock updated.`,
    );
  }

  function addInventoryItem() {
    const name = stockName.trim();
    const qty = Number(stockQuantity);
    const price = Number(stockPrice);
    const lowAt = Number(stockLowAt);

    if (!name) return setNotice("Enter an item name.");

    if (
      inventory.some((item) => item.name.toLowerCase() === name.toLowerCase())
    ) {
      return setNotice("That inventory item already exists. Use Restock instead.");
    }

    if (
      !Number.isInteger(qty) ||
      qty < 0 ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(lowAt) ||
      lowAt < 0
    ) {
      return setNotice("Check quantity, price and low-stock threshold.");
    }

    const newItem: InventoryItem = {
      id: Date.now(),
      name,
      category: stockCategory,
      quantity: qty,
      unit: stockUnit.trim() || "pieces",
      price,
      lowStockAt: lowAt,
    };

    setInventory((previous) => [...previous, newItem]);
    setFoodItem(name);
    setStockName("");
    setNotice(`${name} added to inventory.`);
  }

  function restockInventory() {
    const qty = Number(restockQuantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return setNotice("Enter a restock quantity of at least 1.");
    }

    const item = inventory.find((stock) => stock.id === Number(restockItemId));

    if (!item) return setNotice("Select an inventory item.");

    setInventory((previous) =>
      previous.map((stock) =>
        stock.id === item.id
          ? { ...stock, quantity: stock.quantity + qty }
          : stock,
      ),
    );

    setNotice(`Restocked ${item.name} by ${qty} ${item.unit}.`);
  }

  function assignStation() {
    const station = stations.find((s) => s.id === stationId);
    const customer = customers.find((c) => c.id === selectedId);
    const mins = Number(minutes);

    if (!station || !customer) return setNotice("Select a valid station and customer.");
    if (station.customerId) return setNotice("That station is already occupied.");

    if (!Number.isInteger(mins) || mins <= 0) {
      return setNotice("Enter a positive whole number of minutes.");
    }

    if (customer.gamingMinutes < mins) {
      return setNotice(
        `This customer has only ${duration(customer.gamingMinutes)} of prepaid gaming time.`,
      );
    }

    updateCustomer(customer.id, {
      gamingMinutes: customer.gamingMinutes - mins,
    });

    setStations((previous) =>
      previous.map((s) =>
        s.id === stationId
          ? {
              ...s,
              customerId: customer.id,
              game: s.type === "PC" ? game : "Console gaming",
              sessionMinutes: mins,
              running: true,
            }
          : s,
      ),
    );

    setNotice(
      `${customer.name} assigned to ${stationId} for ${duration(mins)}. Demo timer started.`,
    );

    setPage("Gaming Stations");
  }

  function endSession(id: string) {
    const station = stations.find((s) => s.id === id);

    if (!station || !station.customerId) return;

    const customer = customers.find((c) => c.id === station.customerId);

    if (customer) {
      updateCustomer(customer.id, {
        gamingMinutes: customer.gamingMinutes + station.sessionMinutes,
      });
    }

    setStations((previous) =>
      previous.map((s) =>
        s.id === id
          ? {
              ...s,
              customerId: null,
              game: "",
              sessionMinutes: 0,
              running: false,
            }
          : s,
      ),
    );

    setNotice(`${id} session ended. Its full demo duration was returned to prepaid time.`);
  }

  function toggleSession(id: string) {
    setStations((previous) =>
      previous.map((s) => (s.id === id ? { ...s, running: !s.running } : s)),
    );
  }

  const navigation = [
    "Dashboard",
    "Gaming Stations",
    "Customers & Wallets",
    "Add Gaming Time",
    "Inventory",
    "Transactions",
    "Customer UI Preview",
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GT</div>
          <div>
            <strong>GAMERS TOWN</strong>
            <span>MANAGEMENT CONSOLE</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav>
          {navigation.map((item) => (
            <button
              key={item}
              className={`nav-item ${page === item ? "active" : ""}`}
              onClick={() => {
                setPage(item);
                setNotice("");
              }}
            >
              <span>
                {item === "Dashboard"
                  ? "◈"
                  : item === "Gaming Stations"
                    ? "▦"
                    : item === "Inventory"
                      ? "▤"
                      : item === "Transactions"
                        ? "⇄"
                        : "◉"}
              </span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          Demo mode active
          <small>Local prototype · No live payments</small>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <div className="eyebrow">GAMING LAB / MANAGEMENT</div>
            <h1>{page}</h1>
          </div>

          <div className="admin-chip">
            <span className="admin-avatar">A</span>
            <div>
              <strong>Super Admin</strong>
              <small>Prototype mode</small>
            </div>
          </div>
        </header>

        {notice && (
          <div className="notice">
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>✕</button>
          </div>
        )}

        {page === "Dashboard" && (
          <>
            <section className="welcome-panel">
              <div>
                <div className="eyebrow">CONTROL CENTER</div>
                <h2>Your gaming floor, at a glance.</h2>
                <p>Manage seats, prepaid gaming time, customer wallets and demo transactions.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => setPage("Add Gaming Time")}
              >
                + Add gaming time
              </button>
            </section>

            <section className="stats-grid">
              <Stat title="TOTAL STATIONS" value={String(stations.length)} detail="PCs and consoles" />
              <Stat title="OCCUPIED STATIONS" value={String(activeStations)} detail={`${stations.length - activeStations} currently available`} />
              <Stat title="CUSTOMER WALLETS" value={money(totalWallet)} detail={`${customers.length} demo customers`} />
              <Stat title="PREPAID GAMING TIME" value={duration(totalGamingMinutes)} detail="Unused customer minutes" />
            </section>

            <section className="section-heading">
              <div>
                <h2>Gaming floor</h2>
                <p>Current station assignment overview</p>
              </div>

              <button
                className="secondary-button"
                onClick={() => setPage("Gaming Stations")}
              >
                View all stations →
              </button>
            </section>

            <StationGrid
              stations={stations.slice(0, 8)}
              customers={customers}
              onEnd={endSession}
              onToggle={toggleSession}
            />

            <section className="section-heading">
              <div>
                <h2>Quick customer lookup</h2>
                <p>Search by name or Customer ID</p>
              </div>
            </section>

            <CustomerSearch
              search={search}
              setSearch={setSearch}
              customers={filteredCustomers}
              select={(id) => {
                setSelectedId(id);
                setPage("Add Gaming Time");
              }}
            />
          </>
        )}

        {page === "Gaming Stations" && (
          <>
            <section className="stats-grid compact-stats">
              <Stat title="TOTAL" value={String(stations.length)} detail="All configured demo seats" />
              <Stat title="OCCUPIED" value={String(activeStations)} detail="Assigned to customers" />
              <Stat title="AVAILABLE" value={String(stations.length - activeStations)} detail="Ready for assignment" />
            </section>

            <StationGrid
              stations={stations}
              customers={customers}
              onEnd={endSession}
              onToggle={toggleSession}
            />

            <section className="panel assign-panel">
              <h2>Assign a customer to a station</h2>
              <p>Uses prepaid gaming minutes. This is a local prototype, not a real device lock or server-side timer.</p>

              <div className="form-grid">
                <Field label="Customer">
                  <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Available station">
                  <select value={stationId} onChange={(e) => setStationId(e.target.value)}>
                    {stations
                      .filter((s) => !s.customerId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id} ({s.type})
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Game">
                  <select value={game} onChange={(e) => setGame(e.target.value)}>
                    {initialGames.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Session minutes">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                  />
                </Field>
              </div>

              <button className="primary-button" onClick={assignStation}>
                Assign station & start demo session
              </button>
            </section>
          </>
        )}

        {page === "Customers & Wallets" && (
          <>
            <section className="stats-grid compact-stats">
              <Stat title="CUSTOMERS" value={String(customers.length)} detail="Local demo accounts" />
              <Stat title="WALLET FUNDS" value={money(totalWallet)} detail="Separate from gaming time" />
              <Stat title="PREPAID TIME" value={duration(totalGamingMinutes)} detail="Available to consume" />
            </section>

            <section className="panel">
              <h2>Customer ID search</h2>
              <p>Search by customer ID or name to see both balances.</p>

              <CustomerSearch
                search={search}
                setSearch={setSearch}
                customers={filteredCustomers}
                select={setSelectedId}
              />

              <div className="customer-table">
                <div className="table-head">
                  <span>Customer</span>
                  <span>Wallet balance</span>
                  <span>Unused gaming time</span>
                  <span>Action</span>
                </div>

                {filteredCustomers.map((c) => (
                  <div className="table-row" key={c.id}>
                    <div>
                      <strong>{c.name}</strong>
                      <small>{c.id}</small>
                    </div>
                    <strong>{money(c.wallet)}</strong>
                    <strong>{duration(c.gamingMinutes)}</strong>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setSelectedId(c.id);
                        setPage("Add Gaming Time");
                      }}
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {page === "Add Gaming Time" && (
          <div className="manage-layout">
            <section className="panel manage-main">
              <div className="eyebrow">CUSTOMER QUICK DESK</div>
              <h2>Manage everything with Customer ID</h2>
              <p>Enter the customer's exact ID to load their wallet, prepaid gaming time and food/drink options.</p>

              <div
                className="customer-id-desk"
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "end",
                  flexWrap: "wrap",
                  margin: "18px 0",
                }}
              >
                <div style={{ flex: "1 1 240px" }}>
                  <Field label="Customer ID">
                    <input
                      value={customerIdLookup}
                      onChange={(e) => setCustomerIdLookup(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") findCustomerById();
                      }}
                      placeholder="Enter ID e.g. GT-1001"
                    />
                  </Field>
                </div>

                <button className="primary-button" onClick={findCustomerById}>
                  Find Customer
                </button>
              </div>

              {verifiedCustomerId && selectedCustomer && selectedCustomer.id === verifiedCustomerId ? (
                <>
                  <div className="selected-customer">
                    <div className="customer-avatar">
                      {selectedCustomer.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <strong>{selectedCustomer.name}</strong>
                      <small>{selectedCustomer.id}</small>
                    </div>
                    <span className="badge">ID Verified</span>
                  </div>

                  <div className="balance-grid">
                    <div className="balance-card">
                      <span>WALLET BALANCE</span>
                      <strong>{money(selectedCustomer.wallet)}</strong>
                      <small>Available for wallet spending</small>
                    </div>
                    <div className="balance-card green">
                      <span>PREPAID GAMING TIME</span>
                      <strong>{duration(selectedCustomer.gamingMinutes)}</strong>
                      <small>{selectedCustomer.gamingMinutes} unused minutes</small>
                    </div>
                  </div>

                  <div className="subsection">
                    <h3>Add Gaming Time</h3>
                    <p>Gaming time is tracked separately from wallet money.</p>

                    <div className="quick-minutes">
                      {[
                        { label: "15 Min", minutes: 15 },
                        { label: "30 Min", minutes: 30 },
                        { label: "45 Min", minutes: 45 },
                        { label: "1 Hour", minutes: 60 },
                        { label: "3 Hours", minutes: 180 },
                        { label: "5 Hours", minutes: 300 },
                        { label: "10 Hours", minutes: 600 },
                      ].map((preset) => (
                        <button
                          key={preset.minutes}
                          className={Number(minutes) === preset.minutes ? "chosen" : ""}
                          onClick={() => setMinutes(String(preset.minutes))}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <Field label="Custom gaming minutes">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        placeholder="Enter minutes"
                      />
                    </Field>

                    <Field label="Hourly rate (₹)">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                      />
                    </Field>

                    <div className="charge-line">
                      <span>Calculated charge (demo)</span>
                      <strong>
                        {Number(minutes) > 0 && Number(hourlyRate) >= 0
                          ? money((Number(minutes) / 60) * Number(hourlyRate))
                          : "—"}
                      </strong>
                    </div>

                    <Field label="Payment method">
                      <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Card</option>
                        <option>Other</option>
                      </select>
                    </Field>

                    <button className="primary-button full-button" onClick={addGamingTime}>
                      ＋ Add gaming time
                    </button>
                  </div>

                  <div className="subsection">
                    <h3>Add Food & Drinks</h3>
                    <p>Select an item and quantity. The total is deducted from the customer's wallet if enough balance is available.</p>

                    <Field label="Food or drink">
                      <select value={foodItem} onChange={(e) => setFoodItem(e.target.value)}>
                        {inventory.map((item) => (
                          <option key={item.id} value={item.name}>
                            {item.name} — {money(item.price)} ({item.quantity} left)
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Quantity">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={foodQuantity}
                        onChange={(e) => setFoodQuantity(e.target.value)}
                      />
                    </Field>

                    <div className="charge-line">
                      <span>Food/drink total</span>
                      <strong>
                        {money(
                          (inventory.find((x) => x.name === foodItem)?.price ?? 0) *
                            Math.max(0, Number(foodQuantity) || 0),
                        )}
                      </strong>
                    </div>

                    <button className="primary-button full-button" onClick={addFoodDrink}>
                      ＋ Add item, deduct wallet & stock
                    </button>
                  </div>

                  <div className="subsection">
                    <h3>Add Money to Wallet</h3>

                    <Field label="Amount to add (₹)">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                      />
                    </Field>

                    <Field label="Payment method">
                      <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Card</option>
                        <option>Other</option>
                      </select>
                    </Field>

                    <button className="secondary-button full-button" onClick={addWalletMoney}>
                      ＋ Add money to wallet
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <strong>Find a customer to begin</strong>
                  <p>
                    Enter an exact Customer ID such as GT-1001, GT-1002, GT-1003 or GT-1004.
                    Balances and controls appear after the ID is found.
                  </p>
                </div>
              )}
            </section>

            <aside className="panel side-summary">
              <h3>Account summary</h3>

              {verifiedCustomerId && selectedCustomer && selectedCustomer.id === verifiedCustomerId ? (
                <>
                  <div className="summary-row">
                    <span>Customer ID</span>
                    <strong>{selectedCustomer.id}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Customer</span>
                    <strong>{selectedCustomer.name}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Wallet funds</span>
                    <strong>{money(selectedCustomer.wallet)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Gaming minutes</span>
                    <strong>{selectedCustomer.gamingMinutes}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Gaming time</span>
                    <strong>{duration(selectedCustomer.gamingMinutes)}</strong>
                  </div>
                </>
              ) : (
                <p>Customer details will appear here after ID lookup.</p>
              )}

              <div className="demo-warning">
                Prototype only. No real payment is processed. Sample data resets when the page reloads.
              </div>
            </aside>
          </div>
        )}

        {page === "Inventory" && (
          <>
            <section className="stats-grid compact-stats">
              <Stat title="STOCK ITEMS" value={String(inventory.length)} detail="All tracked products" />
              <Stat title="LOW STOCK ALERTS" value={String(lowStockCount)} detail="At or below reorder level" />
              <Stat title="ESTIMATED STOCK VALUE" value={money(inventoryValue)} detail="Quantity × selling price estimate" />
            </section>

            {lowStockCount > 0 && (
              <div className="notice">
                <span>
                  Low stock:{" "}
                  {inventory
                    .filter((item) => item.quantity <= item.lowStockAt)
                    .map((item) => `${item.name} (${item.quantity} left)`)
                    .join(", ")}
                </span>
              </div>
            )}

            <section className="panel">
              <h2>Inventory & stock levels</h2>
              <p>See every tracked item, current quantity, selling price and reorder threshold.</p>

              <div className="customer-table">
                <div
                  className="table-head"
                  style={{ gridTemplateColumns: "1.4fr .8fr .9fr .8fr .8fr .8fr" }}
                >
                  <span>Item</span>
                  <span>Category</span>
                  <span>In stock</span>
                  <span>Price</span>
                  <span>Low-stock at</span>
                  <span>Status</span>
                </div>

                {inventory.map((item) => (
                  <div
                    className="table-row"
                    key={item.id}
                    style={{ gridTemplateColumns: "1.4fr .8fr .9fr .8fr .8fr .8fr" }}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <small>{item.unit}</small>
                    </div>
                    <span>{item.category}</span>
                    <strong>{item.quantity} {item.unit}</strong>
                    <strong>{money(item.price)}</strong>
                    <span>{item.lowStockAt}</span>
                    <span className={`badge ${item.quantity <= item.lowStockAt ? "warning" : ""}`}>
                      {item.quantity <= item.lowStockAt ? "LOW STOCK" : "IN STOCK"}
                    </span>
                  </div>
                ))}
              </div>

              {inventory.length === 0 && (
                <Empty message="No inventory items yet. Add your first item below." />
              )}
            </section>

            <div className="manage-layout" style={{ marginTop: 16 }}>
              <section className="panel manage-main">
                <h2>＋ Add new stock item</h2>

                <div className="form-grid">
                  <Field label="Item name">
                    <input
                      value={stockName}
                      onChange={(e) => setStockName(e.target.value)}
                      placeholder="e.g. Energy Drink"
                    />
                  </Field>

                  <Field label="Category">
                    <select value={stockCategory} onChange={(e) => setStockCategory(e.target.value)}>
                      <option>Snacks</option>
                      <option>Drinks</option>
                      <option>Food</option>
                      <option>Accessories</option>
                      <option>Other</option>
                    </select>
                  </Field>

                  <Field label="Starting quantity">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                    />
                  </Field>

                  <Field label="Unit">
                    <input
                      value={stockUnit}
                      onChange={(e) => setStockUnit(e.target.value)}
                      placeholder="pieces, cans, packs"
                    />
                  </Field>

                  <Field label="Selling price (₹)">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={stockPrice}
                      onChange={(e) => setStockPrice(e.target.value)}
                    />
                  </Field>

                  <Field label="Low-stock alert at">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={stockLowAt}
                      onChange={(e) => setStockLowAt(e.target.value)}
                    />
                  </Field>
                </div>

                <button className="primary-button" onClick={addInventoryItem}>
                  Add item to inventory
                </button>
              </section>

              <section className="panel side-summary">
                <h2>Restock existing item</h2>

                <Field label="Choose item">
                  <select
                    value={restockItemId}
                    onChange={(e) => setRestockItemId(e.target.value)}
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — {item.quantity} {item.unit} left
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Quantity received">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                  />
                </Field>

                <button
                  className="secondary-button full-button"
                  onClick={restockInventory}
                  disabled={inventory.length === 0}
                >
                  ＋ Update stock quantity
                </button>

                <div className="demo-warning">
                  Demo inventory is stored in browser memory. It resets when the page reloads.
                  Production needs a database and stock audit history.
                </div>
              </section>
            </div>
          </>
        )}

        {page === "Transactions" && (
          <section className="panel">
            <h2>Transaction history</h2>
            <p>Demo records created during this browser session.</p>

            {transactions.length === 0 ? (
              <Empty message="No transactions yet. Add gaming time or wallet money to create a demo record." />
            ) : (
              <div className="customer-table">
                <div className="table-head transaction-head">
                  <span>Customer / Date</span>
                  <span>Transaction</span>
                  <span>Amount</span>
                  <span>Payment</span>
                </div>

                {transactions.map((t) => (
                  <div className="table-row transaction-row" key={t.id}>
                    <div>
                      <strong>{t.customerId}</strong>
                      <small>{t.date}</small>
                    </div>
                    <div>
                      <strong>{t.type}</strong>
                      <small>
                        {t.minutes
                          ? `${t.minutes} minutes`
                          : t.type === "Food & Drinks"
                            ? "Food/drink purchase"
                            : "Wallet top-up"}
                      </small>
                    </div>
                    <strong>{money(t.amount)}</strong>
                    <span className="badge">{t.payment}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "Customer UI Preview" && <CustomerPreview />}

        <footer className="footer">
          <span>GAMERS TOWN · Management Console</span>
          <span>Prototype only — not production billing or device control</span>
        </footer>
      </main>
    </div>
  );
}

function Stat({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function CustomerSearch({
  search,
  setSearch,
  customers,
  select,
}: {
  search: string;
  setSearch: (value: string) => void;
  customers: Customer[];
  select: (id: string) => void;
}) {
  return (
    <div className="customer-search">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search Customer ID or name..."
      />

      <div className="customer-search-results">
        {customers.map((c) => (
          <button key={c.id} onClick={() => select(c.id)}>
            <span>
              <strong>{c.id}</strong>
              <small>{c.name}</small>
            </span>
            <span className="search-balances">
              {duration(c.gamingMinutes)} · {money(c.wallet)}
            </span>
          </button>
        ))}

        {customers.length === 0 && <p>No customers found.</p>}
      </div>
    </div>
  );
}

function StationGrid({
  stations,
  customers,
  onEnd,
  onToggle,
}: {
  stations: Station[];
  customers: Customer[];
  onEnd: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="station-grid">
      {stations.map((station) => {
        const customer = customers.find((c) => c.id === station.customerId);
        const occupied = Boolean(customer);

        return (
          <article
            className={`station-card ${occupied ? "occupied" : ""}`}
            key={station.id}
          >
            <div className="station-top">
              <div>
                <span className="station-type">{station.type}</span>
                <h3>{station.id}</h3>
              </div>
              <span className={`station-status ${occupied ? "busy" : "free"}`}>
                {occupied ? "OCCUPIED" : "AVAILABLE"}
              </span>
            </div>

            {occupied && customer ? (
              <>
                <div className="station-customer">
                  <div className="customer-avatar small">
                    {customer.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <strong>{customer.name}</strong>
                    <small>{customer.id}</small>
                  </div>
                </div>

                <div className="station-detail">
                  <span>Game</span>
                  <strong>{station.game || "Not selected"}</strong>
                </div>
                <div className="station-detail">
                  <span>Session remaining*</span>
                  <strong className="time-value">{duration(station.sessionMinutes)}</strong>
                </div>
                <div className="station-detail">
                  <span>Wallet balance</span>
                  <strong>{money(customer.wallet)}</strong>
                </div>
                <div className="station-detail">
                  <span>Other prepaid time</span>
                  <strong>{duration(customer.gamingMinutes)}</strong>
                </div>

                <div className="station-actions">
                  <button
                    className="secondary-button"
                    onClick={() => onToggle(station.id)}
                  >
                    {station.running ? "Pause demo" : "Resume demo"}
                  </button>
                  <button className="end-button" onClick={() => onEnd(station.id)}>
                    End
                  </button>
                </div>
              </>
            ) : (
              <div className="station-empty">
                <span className="empty-icon">＋</span>
                <strong>Ready for player</strong>
                <small>No customer assigned</small>
                <small>No active game or session</small>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="empty-state">
      <span>⇄</span>
      <strong>Nothing to show yet</strong>
      <p>{message}</p>
    </div>
  );
}

function CustomerPreview() {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [game, setGame] = useState("Valorant");
  const [seconds, setSeconds] = useState(95 * 60);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [summary, setSummary] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const initialSeconds = 95 * 60;
  const usedSeconds = initialSeconds - seconds;
  const estimatedBill = Math.max(0, Math.ceil(usedSeconds / 60) * (100 / 60));
  const games = [
    { name: "Valorant", image: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg" },
    { name: "Counter-Strike 2", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_600x900.jpg" },
    { name: "Steam", image: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg" },
    { name: "GTA V", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg" },
    { name: "Cyberpunk 2077", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg" },
  ];

  useEffect(() => {
    if (!loggedIn || !running || ended || seconds <= 0) return;
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          setRunning(false);
          setEnded(true);
          setSummary(true);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loggedIn, running, ended, seconds]);

  const formatTime = (total: number) => {
    const safe = Math.max(0, total);
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const sec = safe % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customerId.trim() !== "atharva011" || password !== "150207") {
      setError("Invalid Customer ID or password.");
      return;
    }
    setError("");
    setLoggedIn(true);
    setSummary(false);
    setEnded(false);
    setSeconds(initialSeconds);
    // The session starts immediately after a successful login.
    setRunning(true);
  };

  const endSession = () => {
    setRunning(false);
    setEnded(true);
    setSummary(true);
  };

  const logout = () => {
    setLoggedIn(false);
    setCustomerId("");
    setPassword("");
    setError("");
    setRunning(false);
    setEnded(false);
    setSummary(false);
    setSeconds(initialSeconds);
    setGame("Valorant");
  };

  return (
    <section className="customer-preview">
      <header className="preview-topbar">
        <div className="preview-brand">
          <div className="brand-mark">GT</div>
          <div><strong>GAMERS TOWN</strong><span>PLAYER PORTAL</span></div>
        </div>
        {loggedIn && <button className="secondary-button" onClick={logout}>Log out</button>}
      </header>

      {!loggedIn ? (
        <form className="login-card" onSubmit={login}>
          <div className="eyebrow">GAMERSTOWN MEMBER ACCESS</div>
          <h2>Ready to play?</h2>
          <p>Sign in to access your gaming account.</p>
          <label className="field">
            <span>Customer ID</span>
            <input value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="Enter your customer ID" autoComplete="username" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required />
          </label>
          {error && <p className="customer-error">{error}</p>}
          <button className="primary-button full-button" type="submit">Sign in to gaming →</button>
          <p className="customer-hint">Forgot your details? Please ask the counter staff.</p>
          <button className="text-button" type="button" onClick={() => setShowAdmin(!showAdmin)}>Admin login</button>
          {showAdmin && <p className="customer-hint">Use the admin dashboard sidebar to return to admin access.</p>}
        </form>
      ) : summary ? (
        <div className="customer-panel session-summary">
          <div className="eyebrow">SESSION SUMMARY</div>
          <h2>{seconds === 0 ? "Time is up!" : "Session ended"}</h2>
          <p>Your gaming session has stopped.</p>
          <div className="customer-stat-grid">
            <div className="customer-stat"><span>Station</span><strong>PC-04</strong></div>
            <div className="customer-stat"><span>Game</span><strong>{game}</strong></div>
            <div className="customer-stat"><span>Time used</span><strong>{formatTime(usedSeconds)}</strong></div>
            <div className="customer-stat"><span>Time remaining</span><strong>{formatTime(seconds)}</strong></div>
          </div>
          <div className="customer-bill"><span>Estimated session amount</span><strong>₹{estimatedBill.toFixed(2)}</strong></div>
          <p className="customer-hint">Please visit the counter for final billing and payment. This is a demo estimate, not a real invoice.</p>
          <button className="primary-button full-button" onClick={logout}>Return to customer login</button>
        </div>
      ) : (
        <div className="customer-dashboard">
          <div className="customer-welcome">
            <div><div className="eyebrow">PLAYER DASHBOARD</div><h2>Welcome back, Atharva!</h2><p>Customer ID: {customerId}</p></div>
            <div className="station-chip">● PC-04 · ACTIVE STATION</div>
          </div>
          <div className="customer-stat-grid">
            <div className="customer-stat timer-stat"><span>TIME REMAINING</span><strong className="timer-number">{formatTime(seconds)}</strong><small>{running ? "Your session is running" : "Session ended"}</small></div>
            <div className="customer-stat"><span>WALLET BALANCE</span><strong>₹450.00</strong><small>Demo balance · Counter managed</small></div>
            <div className="customer-stat"><span>YOUR STATION</span><strong>PC-04</strong><small>Gaming PC</small></div>
          </div>
          <div className="customer-panel">
            <div className="customer-section-heading"><div><div className="eyebrow">GAME LIBRARY</div><h3>What do you want to play?</h3></div><span className="customer-count">{games.length} titles</span></div>
            <div className="customer-game-grid">
              {games.map((item) => <button key={item.name} className={`customer-game ${game === item.name ? "selected" : ""}`} onClick={() => setGame(item.name)} disabled={ended}><img className="customer-game-image" src={item.image} alt={`${item.name} demo cover`} loading="lazy" /><span className="customer-game-title"><strong>{item.name}</strong><small>{game === item.name ? "Selected" : "Select game"}</small></span></button>)}
            </div>
            <p className="customer-hint">Game selection is a preview only; it does not launch or control games on the PC.</p>
          </div>
          <div className="customer-panel">
            <div className="eyebrow">GAMING SESSION</div>
            <h3>{running ? "Your session is live!" : "Session ended"}</h3>
            <p className="customer-hint">Currently selected game: <strong>{game}</strong></p>
            <div className="counter-notice"><strong>Need food, drinks or extra gaming time?</strong><p>Please visit the counter. Orders, additional time and payments are handled by staff.</p></div>
            {!ended && <button className="danger-button" onClick={() => { if (window.confirm("End your gaming session and view the summary?")) endSession(); }}>End session</button>}
          </div>
          <p className="customer-hint customer-disclaimer">DEMO PREVIEW · Timer, wallet and billing are not connected to the admin database or real gaming station.</p>
        </div>
      )}
      {!loggedIn && <p className="preview-footnote">NEED HELP? PLEASE VISIT THE GAMING COUNTER.</p>}
    </section>
  );
}

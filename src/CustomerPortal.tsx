
import { useState, type FormEvent, type CSSProperties } from "react";
import CustomerDashboard from "./CustomerDashboard";

export default function CustomerPortal() {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      customerId.trim() === "atharva011" &&
      password === "150207"
    ) {
      setError("");
      setLoggedIn(true);
    } else {
      setError("Incorrect customer ID or password.");
    }
  }

  if (loggedIn) {
    return <CustomerDashboard />;
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.logo}>
          G<span style={{ color: "#a3e635" }}>T</span>
          <span style={styles.logoDot}>.</span>
        </div>

        <div style={styles.badge}>GAMERSTOWN MEMBER ACCESS</div>

        <h1 style={styles.heading}>Ready to play?</h1>

        <p style={styles.subtitle}>
          Sign in to access your gaming account.
        </p>

        <form onSubmit={handleLogin} style={styles.form}>
          <label htmlFor="customerId" style={styles.label}>
            CUSTOMER ID
          </label>

          <input
            id="customerId"
            type="text"
            autoComplete="username"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            placeholder="Enter your customer ID"
            style={styles.input}
            required
          />

          <label htmlFor="customerPassword" style={styles.label}>
            PASSWORD
          </label>

          <div style={styles.passwordWrapper}>
            <input
              id="customerPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              style={{ ...styles.input, paddingRight: 70 }}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              style={styles.showButton}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          {error && (
            <div role="alert" style={styles.error}>
              {error}
            </div>
          )}

          <button type="submit" style={styles.loginButton}>
            <span>SIGN IN TO GAMING</span>
            <span>→</span>
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.statusDot} />
          <span>GAMING FLOOR SYSTEM</span>
          <span style={styles.demo}>LOCAL DEMO</span>
        </div>
      </section>

      <p style={styles.bottomText}>
        NEED HELP? PLEASE VISIT THE GAMING COUNTER.
      </p>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    background:
      "radial-gradient(ellipse at top, #1b2b20 0%, #0b100d 52%, #070908 100%)",
    color: "#f4f7f4",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    boxSizing: "border-box",
    padding: 36,
    background: "#111713",
    border: "1px solid #29372d",
    borderRadius: 18,
    boxShadow: "0 24px 80px #0008",
  },
  logo: {
    fontSize: 42,
    fontWeight: 900,
    letterSpacing: -4,
    marginBottom: 22,
  },
  logoDot: {
    color: "#a3e635",
  },
  badge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: "#a3e635",
    background: "#a3e63512",
    border: "1px solid #a3e63540",
    borderRadius: 5,
    padding: "8px 10px",
  },
  heading: {
    fontSize: 32,
    letterSpacing: -1,
    margin: "20px 0 8px",
  },
  subtitle: {
    color: "#9ba69e",
    fontSize: 14,
    lineHeight: 1.6,
    margin: "0 0 26px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 11,
  },
  label: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1,
    color: "#d5ddd6",
    marginTop: 7,
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    background: "#0b100d",
    border: "1px solid #354239",
    color: "#ffffff",
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    outlineColor: "#a3e635",
  },
  passwordWrapper: {
    position: "relative",
  },
  showButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: 0,
    color: "#a3e635",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
    padding: 8,
  },
  loginButton: {
    marginTop: 15,
    width: "100%",
    boxSizing: "border-box",
    border: 0,
    borderRadius: 8,
    padding: 16,
    background: "#a3e635",
    color: "#11170c",
    fontWeight: 900,
    fontSize: 12,
    letterSpacing: 0.7,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  error: {
    color: "#ff9999",
    background: "#4a1717",
    border: "1px solid #7c2929",
    padding: 11,
    borderRadius: 7,
    fontSize: 12,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderTop: "1px solid #29352c",
    marginTop: 28,
    paddingTop: 18,
    color: "#849087",
    fontSize: 9,
    letterSpacing: 0.7,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#a3e635",
    flexShrink: 0,
  },
  demo: {
    marginLeft: "auto",
    whiteSpace: "nowrap",
  },
  bottomText: {
    marginTop: 24,
    color: "#728077",
    fontSize: 10,
    letterSpacing: 1,
    textAlign: "center",
  },
};

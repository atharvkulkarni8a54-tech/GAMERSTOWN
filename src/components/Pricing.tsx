
import { useEffect, useState } from "react";
import { getPricingPackages, type PricingPackage } from "../lib/pricing";

export default function Pricing() {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPackages() {
      try {
        const data = await getPricingPackages();
        setPackages(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load pricing packages."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPackages();
  }, []);

  return (
    <section className="panel">
      <h2>Gaming Packages & Pricing</h2>
      <p>Prices loaded from the GAMERS TOWN database.</p>

      {loading && <p>Loading packages...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && packages.length === 0 && (
        <p>No active pricing packages found.</p>
      )}

      {!loading && !error && packages.length > 0 && (
        <div className="customer-table">
          <div className="table-head">
            <span>Package</span>
            <span>Duration</span>
            <span>Weekday</span>
            <span>Weekend</span>
          </div>

          {packages.map((item) => (
            <div className="table-row" key={item.id}>
              <strong>{item.package_name}</strong>
              <span>{item.duration_minutes / 60} hour(s)</span>
              <strong>₹{Number(item.weekday_price).toFixed(2)}</strong>
              <strong>₹{Number(item.weekend_price).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

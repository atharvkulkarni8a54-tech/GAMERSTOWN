import { useEffect, useState } from "react";
import { getPricingPackages, type PricingPackage } from "../lib/pricing";

export default function Pricing() {
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPricingPackages()
      .then((rows) => { if (active) setPackages(rows); })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load pricing packages.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="panel">
      <h2>Gaming packages & pricing</h2>
      <p>Active packages are loaded from the Supabase pricing table.</p>
      {loading ? <p>Loading packages…</p> : error ? <p role="alert">{error}</p> : packages.length === 0 ? (
        <p>No active pricing packages found. Add active packages in Supabase to display them here.</p>
      ) : (
        <div className="customer-table">
          <div className="table-head"><span>Package</span><span>Duration</span><span>Weekday</span><span>Weekend</span></div>
          {packages.map((item) => (
            <div className="table-row" key={item.id}>
              <span>{item.package_name}</span>
              <span>{item.duration_minutes >= 60 ? `${item.duration_minutes / 60} hr${item.duration_minutes === 60 ? "" : "s"}` : `${item.duration_minutes} min`}</span>
              <span>₹{Number(item.weekday_price).toFixed(0)}</span>
              <span>₹{Number(item.weekend_price).toFixed(0)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

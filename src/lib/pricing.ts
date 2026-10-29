
import { supabase } from "./supabase";

export type PricingPackage = {
  id: string;
  package_name: string;
  duration_minutes: number;
  weekday_price: number;
  weekend_price: number;
  active: boolean;
};

export async function getPricingPackages(): Promise<PricingPackage[]> {
  const { data, error } = await supabase
    .from("pricing_packages")
    .select(
      "id, package_name, duration_minutes, weekday_price, weekend_price, active"
    )
    .eq("active", true)
    .order("duration_minutes", { ascending: true });

  if (error) {
    throw new Error(`Failed to load pricing packages: ${error.message}`);
  }

  return (data ?? []) as PricingPackage[];
}

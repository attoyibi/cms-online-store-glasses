import { SettingsForm } from "@/components/admin/settings-form";
import { siteConfig } from "@/lib/site-config";
import { requireAdmin } from "@/lib/supabase/admin";
import type { StoreSettings } from "@/lib/types";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Baris pengaturan dibuat oleh v1/01_schema.sql. Kalau belum ada —
  // misalnya tabelnya dibuat manual — form ini yang akan membuatnya.
  const settings: StoreSettings = (data as StoreSettings | null) ?? {
    id: "",
    store_name: siteConfig.name,
    whatsapp_number: siteConfig.whatsappNumber,
    address: siteConfig.address,
    email: siteConfig.email,
    instagram_url: siteConfig.instagram,
    open_hours: siteConfig.openHours,
    announcement: null,
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Pengaturan Toko</h1>
        <p className="text-sm text-muted-foreground">
          Perubahan langsung tampil di header, footer, dan seluruh tombol
          WhatsApp.
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  );
}

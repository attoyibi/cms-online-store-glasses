import { SeoTabs } from "@/components/admin/seo-tabs";

export default function AdminSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">SEO &amp; Toko</h1>
        <p className="text-sm text-muted-foreground">
          Atur kota, alamat situs, dan data bisnis agar toko mudah ditemukan di
          Google. Berlaku untuk seluruh situs.
        </p>
      </header>
      <SeoTabs />
      {children}
    </div>
  );
}

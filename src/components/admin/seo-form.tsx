"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { saveSeoSettings, type ActionState } from "@/app/admin/actions";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DAY_CODES, DAY_LABELS } from "@/lib/seo-validate";
import type { SeoSettings } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? "Menyimpan…" : "Simpan Pengaturan SEO"}
    </Button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

const textareaClass =
  "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Pratinjau kasar tampilan di Google dan di kartu tautan WhatsApp */
function Previews({
  storeName,
  city,
  tagline,
  description,
  siteUrl,
  ogImage,
}: {
  storeName: string;
  city: string;
  tagline: string;
  description: string;
  siteUrl: string;
  ogImage: string | null;
}) {
  const title = `${storeName} — ${tagline || "Optik"}`;
  const host = siteUrl.replace(/^https?:\/\//, "") || "alamat-situs-belum-diisi";
  const shown = description || `Toko kacamata di ${city || "kota Anda"}.`;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Di hasil pencarian Google
        </p>
        <div className="rounded-lg border bg-background p-4">
          <p className="truncate text-xs text-muted-foreground">{host}</p>
          <p className="mt-0.5 line-clamp-2 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">
            {title.length > 60 ? `${title.slice(0, 58)}…` : title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {shown.length > 160 ? `${shown.slice(0, 158)}…` : shown}
          </p>
        </div>
        {(title.length > 60 || shown.length > 160) && (
          <Hint>Teks terlalu panjang akan dipotong Google seperti di atas.</Hint>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Saat tautan dibagikan di WhatsApp
        </p>
        <div className="overflow-hidden rounded-lg border bg-background">
          {ogImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ogImage}
              alt=""
              className="aspect-[1.91/1] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[1.91/1] w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              Belum ada gambar bagikan
            </div>
          )}
          <div className="space-y-0.5 p-3">
            <p className="line-clamp-1 text-sm font-medium">{title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{shown}</p>
            <p className="truncate text-xs text-muted-foreground">{host}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SeoForm({
  seo,
  storeName,
}: {
  seo: SeoSettings | null;
  storeName: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    saveSeoSettings,
    {},
  );

  const [siteUrl, setSiteUrl] = useState(seo?.site_url ?? "");
  const [city, setCity] = useState(seo?.city ?? "");
  const [tagline, setTagline] = useState(seo?.tagline ?? "");
  const [description, setDescription] = useState(seo?.default_description ?? "");
  const [ogImage, setOgImage] = useState<string | null>(
    seo?.default_og_image ?? null,
  );

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="id" value={seo?.id ?? ""} />

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {state.success}
        </p>
      )}

      <Section
        title="Alamat dan identitas"
        description="Dipakai di judul tab, hasil pencarian Google, dan pratinjau tautan. Semua teks halaman yang memuat {kota} otomatis mengikuti kota di sini."
      >
        <div className="space-y-2">
          <Label htmlFor="site_url">Alamat situs</Label>
          <Input
            id="site_url"
            name="site_url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://tokokacamata.com"
            inputMode="url"
          />
          <Hint>
            Alamat yang diketik pengunjung, tanpa garis miring dan path. Kosong
            = memakai variabel NEXT_PUBLIC_SITE_URL. Alamat yang salah membuat
            sitemap dan tautan kanonik menunjuk ke tempat yang keliru.
          </Hint>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Kota</Label>
            <Input
              id="city"
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Madiun"
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Provinsi</Label>
            <Input
              id="region"
              name="region"
              defaultValue={seo?.region ?? ""}
              placeholder="Jawa Timur"
              maxLength={60}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            name="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Optik Modern Madiun"
            maxLength={80}
          />
          <Hint>Muncul setelah nama toko di judul tab dan hasil Google.</Hint>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_description">Deskripsi situs</Label>
          <textarea
            id="default_description"
            name="default_description"
            rows={3}
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={textareaClass}
            placeholder="Toko kacamata dengan koleksi frame, lensa, dan sunglasses pilihan di Madiun. Konsultasi gratis lewat WhatsApp."
          />
          <Hint>
            {description.length}/300 — idealnya 120–160 karakter. Menyebut kota
            membantu pencarian lokal.
          </Hint>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Gambar saat tautan dibagikan</Label>
            <ImageUploader
              name="default_og_image"
              defaultValue={seo?.default_og_image ? [seo.default_og_image] : []}
              single
              onChange={(images) => setOgImage(images[0] ?? null)}
            />
            <Hint>PNG/JPG, ideal 1200×630. SVG tidak tampil di WhatsApp.</Hint>
          </div>
          <div className="space-y-2">
            <Label>Logo toko</Label>
            <ImageUploader
              name="logo_url"
              defaultValue={seo?.logo_url ? [seo.logo_url] : []}
              single
            />
            <Hint>Persegi, PNG/JPG. Dipakai di data bisnis untuk Google.</Hint>
          </div>
        </div>

        <Previews
          storeName={storeName}
          city={city}
          tagline={tagline}
          description={description}
          siteUrl={siteUrl}
          ogImage={ogImage}
        />
      </Section>

      <Section
        title="Bisnis lokal"
        description="Data toko fisik untuk kartu bisnis Google (pencarian “optik di sekitar saya”). Isi sesuai persis dengan Google Business Profile. Tanpa alamat, data ini tidak dikirim ke Google."
      >
        <div className="space-y-2">
          <Label htmlFor="street_address">Alamat jalan</Label>
          <Input
            id="street_address"
            name="street_address"
            defaultValue={seo?.street_address ?? ""}
            placeholder="Jl. Pahlawan No. 12"
            maxLength={200}
          />
          <Hint>
            Kosong = memakai alamat dari Pengaturan Toko. Kota dan provinsi
            diambil dari isian di atas.
          </Hint>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="postal_code">Kode pos</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={seo?.postal_code ?? ""}
              inputMode="numeric"
              maxLength={5}
              placeholder="63121"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={seo?.phone ?? ""}
              inputMode="tel"
              placeholder="0351 123456"
            />
            <Hint>Kosong = memakai nomor WhatsApp.</Hint>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_range">Kisaran harga</Label>
            <select
              id="price_range"
              name="price_range"
              defaultValue={seo?.price_range ?? ""}
              className="h-9 w-full rounded-lg border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Tidak ditampilkan</option>
              <option value="$">$ — terjangkau</option>
              <option value="$$">$$ — menengah</option>
              <option value="$$$">$$$ — premium</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Lintang (latitude)</Label>
            <Input
              id="latitude"
              name="latitude"
              defaultValue={seo?.latitude ?? ""}
              inputMode="decimal"
              placeholder="-7.6298"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Bujur (longitude)</Label>
            <Input
              id="longitude"
              name="longitude"
              defaultValue={seo?.longitude ?? ""}
              inputMode="decimal"
              placeholder="111.5239"
            />
          </div>
          <div className="sm:col-span-2">
            <Hint>
              Cara termudah: buka toko Anda di Google Maps, klik kanan pada
              titiknya, lalu klik angka koordinat yang muncul untuk menyalin.
              Kosongkan keduanya bila tidak tahu.
            </Hint>
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Hari dan jam buka</legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {DAY_CODES.map((code) => (
              <label key={code} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="open_days"
                  value={code}
                  defaultChecked={seo?.open_days?.includes(code) ?? false}
                  className="size-4 accent-primary"
                />
                {DAY_LABELS[code]}
              </label>
            ))}
          </div>
          <div className="grid max-w-sm grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opens">Buka</Label>
              <Input
                id="opens"
                name="opens"
                type="time"
                defaultValue={seo?.opens ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closes">Tutup</Label>
              <Input
                id="closes"
                name="closes"
                type="time"
                defaultValue={seo?.closes ?? ""}
              />
            </div>
          </div>
          <Hint>
            Satu jadwal untuk semua hari terpilih. Teks jam buka yang tampil
            di footer tetap diatur di Pengaturan Toko.
          </Hint>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="same_as">Profil resmi lain</Label>
          <textarea
            id="same_as"
            name="same_as"
            rows={3}
            defaultValue={(seo?.same_as ?? []).join("\n")}
            className={textareaClass}
            placeholder={
              "https://www.instagram.com/tokoanda\nhttps://www.facebook.com/tokoanda\nhttps://maps.app.goo.gl/…"
            }
          />
          <Hint>
            Satu tautan https:// per baris (maks. 8): Instagram, Facebook,
            TikTok, tautan Google Maps. Membantu Google yakin semuanya satu
            bisnis yang sama.
          </Hint>
        </div>
      </Section>

      <Section
        title="Verifikasi mesin pencari"
        description="Agar bisa melihat data pencarian di Google Search Console dan Bing Webmaster Tools."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="google_verification">Kode verifikasi Google</Label>
            <Input
              id="google_verification"
              name="google_verification"
              defaultValue={seo?.google_verification ?? ""}
              placeholder="Kode atau seluruh tag <meta>"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bing_verification">Kode verifikasi Bing</Label>
            <Input
              id="bing_verification"
              name="bing_verification"
              defaultValue={seo?.bing_verification ?? ""}
              placeholder="Kode atau seluruh tag <meta>"
              autoComplete="off"
            />
          </div>
        </div>
        <Hint>
          Di Search Console pilih “Awalan URL” → metode “Tag HTML”, lalu tempel
          tag yang diberikan ke sini begitu saja.
        </Hint>
      </Section>

      <Section
        title="Pelacakan pengunjung"
        description="Opsional. Hanya aktif di situs yang sudah tayang, bukan saat pengembangan atau pratinjau."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ga4_id">ID Google Analytics 4</Label>
            <Input
              id="ga4_id"
              name="ga4_id"
              defaultValue={seo?.ga4_id ?? ""}
              placeholder="G-XXXXXXXXXX"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_pixel_id">ID Meta Pixel</Label>
            <Input
              id="meta_pixel_id"
              name="meta_pixel_id"
              defaultValue={seo?.meta_pixel_id ?? ""}
              placeholder="123456789012345"
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
        </div>
        <Hint>
          Keduanya mengirim data kunjungan ke pihak ketiga. Bila dipakai,
          cantumkan di kebijakan privasi toko. Kosongkan untuk mematikan.
        </Hint>
      </Section>

      <Section title="Visibilitas">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="noindex_site"
            defaultChecked={seo?.noindex_site ?? false}
            className="mt-0.5 size-4 accent-primary"
          />
          <span>
            <span className="font-medium">
              Sembunyikan seluruh situs dari Google
            </span>
            <br />
            <span className="text-muted-foreground">
              Centang selama situs masih disiapkan. Hapus centang saat siap
              tayang, lalu kirim ulang sitemap di Search Console.
            </span>
          </span>
        </label>
      </Section>

      <div className="border-t pt-5">
        <SubmitButton />
      </div>
    </form>
  );
}

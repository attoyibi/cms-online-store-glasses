"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

import {
  COLOR_SLOTS,
  SLOT_INFO,
  THEMES,
  contrastRatio,
  effectiveColor,
  getTheme,
  themeVars,
  type ColorSlot,
  type ThemeColors,
} from "@/lib/themes";
import { cn } from "@/lib/utils";

/**
 * Pemilih tema warna di Admin → Pengaturan. Mengirim tiga field tersembunyi
 * (theme_present, theme, theme_colors) yang dibaca `saveSettings`.
 */
export function ThemePicker({
  initialTheme,
  initialColors,
}: {
  initialTheme: string | null;
  initialColors: Record<string, string>;
}) {
  const [themeId, setThemeId] = useState(getTheme(initialTheme).id);
  const [overrides, setOverrides] = useState<ThemeColors>(() => {
    const out: ThemeColors = {};
    for (const slot of COLOR_SLOTS) {
      const value = initialColors[slot];
      if (typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)) {
        out[slot] = value.toLowerCase();
      }
    }
    return out;
  });

  const theme = getTheme(themeId);
  const color = (slot: ColorSlot) => effectiveColor(slot, theme, overrides);
  const customCount = Object.keys(overrides).length;

  const textContrast = contrastRatio(color("foreground"), color("background"));
  const accentContrast = contrastRatio(color("primary"), color("background"));
  const warnings = [
    textContrast < 4.5 &&
      "Teks dan latar halaman kurang kontras — tulisan akan sulit dibaca.",
    accentContrast < 3 &&
      "Warna utama terlalu dekat dengan latar halaman — tautan dan judul kecil kurang terlihat.",
  ].filter(Boolean) as string[];

  function setSlot(slot: ColorSlot, value: string) {
    setOverrides((prev) => ({ ...prev, [slot]: value.toLowerCase() }));
  }

  function resetSlot(slot: ColorSlot) {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }

  // Di situs, bar pengumuman & footer mengikuti `ink` karena token-nya diatur
  // pada elemen yang sama. Di pratinjau token-nya sudah terhitung di :root,
  // jadi ikutannya harus ditulis eksplisit.
  const vars = themeVars(themeId, overrides);
  if (vars["--ink"]) {
    for (const name of ["announcement", "footer"]) {
      vars[`--${name}`] ??= vars["--ink"];
      vars[`--${name}-foreground`] ??= vars["--ink-foreground"];
    }
  }
  const previewStyle = vars as React.CSSProperties;

  return (
    <fieldset className="space-y-5">
      <input type="hidden" name="theme_present" value="1" />
      <input type="hidden" name="theme" value={themeId} />
      <input type="hidden" name="theme_colors" value={JSON.stringify(overrides)} />

      <div className="space-y-1">
        <legend className="text-base font-semibold">Tema warna</legend>
        <p className="text-sm text-muted-foreground">
          Pilih tema, lalu sesuaikan warnanya bila perlu. Berlaku untuk situs
          toko; panel admin tidak ikut berubah.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Tema warna"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {THEMES.map((t) => {
          const selected = t.id === themeId;
          const swatch = (slot: ColorSlot) => effectiveColor(slot, t, {});
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setThemeId(t.id);
                setOverrides({});
              }}
              className={cn(
                "relative space-y-2 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected && "border-primary ring-2 ring-primary/30",
              )}
            >
              <span className="flex h-8 overflow-hidden rounded-md border">
                {(["primary", "accent", "secondary", "ink"] as const).map(
                  (slot) => (
                    <span
                      key={slot}
                      className="flex-1"
                      style={{ backgroundColor: swatch(slot) }}
                    />
                  ),
                )}
              </span>
              <span className="block text-sm font-medium">{t.name}</span>
              <span className="block text-xs text-muted-foreground">
                {t.description}
              </span>
              {selected && (
                <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <details className="group rounded-xl border" open={customCount > 0}>
        <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-sm font-medium">
          <span>
            Sesuaikan warna
            {customCount > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {customCount} warna diubah
              </span>
            )}
          </span>
        </summary>

        <div className="space-y-5 border-t px-4 py-4">
          {(["umum", "komponen"] as const).map((group) => (
            <div key={group} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group === "umum" ? "Palet utama" : "Warna per komponen"}
              </p>
              {SLOT_INFO.filter((s) => s.group === group).map((info) => {
                const changed = info.slot in overrides;
                const id = `theme-${info.slot}`;
                return (
                  <div key={info.slot} className="flex items-center gap-3">
                    <input
                      id={id}
                      type="color"
                      value={color(info.slot)}
                      onChange={(e) => setSlot(info.slot, e.target.value)}
                      className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
                    />
                    <label htmlFor={id} className="min-w-0 flex-1 text-sm">
                      <span className="block font-medium">{info.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {info.hint}
                      </span>
                    </label>
                    <code className="hidden font-mono text-xs text-muted-foreground sm:block">
                      {color(info.slot)}
                    </code>
                    <button
                      type="button"
                      onClick={() => resetSlot(info.slot)}
                      disabled={!changed}
                      aria-label={`Kembalikan ${info.label} ke warna tema`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <RotateCcw className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

          {customCount > 0 && (
            <button
              type="button"
              onClick={() => setOverrides({})}
              className="text-sm text-primary underline underline-offset-2"
            >
              Kembalikan semua ke warna tema
            </button>
          )}
        </div>
      </details>

      {warnings.length > 0 && (
        <ul
          role="status"
          className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Pratinjau</p>
        <Preview style={previewStyle} />
        <p className="text-xs text-muted-foreground">
          Hasil lengkap terlihat di situs setelah Anda menekan{" "}
          <strong>Simpan Pengaturan</strong>.
        </p>
      </div>
    </fieldset>
  );
}

/** Miniatur toko: memakai token yang sama dengan situs, ditimpa lewat style */
function Preview({ style }: { style: React.CSSProperties }) {
  return (
    <div
      style={style}
      aria-hidden="true"
      className="overflow-hidden rounded-xl border bg-background text-foreground"
    >
      <div className="scope-announcement bg-ink px-3 py-1.5 text-center text-[11px] text-ink-foreground">
        Gratis ongkir untuk pembelian di atas Rp500.000
      </div>

      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">Nama Toko</span>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Keranjang
        </span>
      </div>

      <div className="bg-brand-soft px-3 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          Koleksi baru
        </p>
        <p className="text-base font-semibold">Kacamata yang pas untukmu</p>
        <span className="mt-2 inline-block rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Lihat Produk
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-secondary/60 p-3">
        {["Frame Klasik", "Frame Bulat"].map((name, i) => (
          <div key={name} className="relative rounded-lg border bg-card p-2">
            {i === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-sale px-2 py-0.5 text-[10px] font-semibold text-white">
                -20%
              </span>
            )}
            <div className="h-10 rounded bg-muted" />
            <p className="mt-1.5 text-xs font-medium">{name}</p>
            <p className="text-xs text-primary">Rp350.000</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="bg-ink px-3 py-3 text-xs text-ink-foreground">
          Banner ajakan — bagian gelap
        </div>
        <div className="scope-footer bg-ink px-3 py-3 text-[11px] text-ink-foreground/75">
          Footer · Alamat · Jam buka
        </div>
        <span className="absolute -top-3 right-3 rounded-full bg-whatsapp px-3 py-1.5 text-[11px] font-medium text-white shadow">
          Chat Kami
        </span>
      </div>
    </div>
  );
}

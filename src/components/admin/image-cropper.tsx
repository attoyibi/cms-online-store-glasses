"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Sisi terpendek gambar sumber; di bawah ini hasilnya pasti buram */
export const MIN_SOURCE_SIDE = 400;
/** Ukuran berkas asli yang boleh dipilih; hasil akhir dikompres jauh lebih kecil */
export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_ZOOM = 4;

type Loaded = { img: HTMLImageElement; url: string; width: number; height: number };

/** Muat berkas jadi gambar; gagal bila rusak atau bukan gambar yang bisa dibuka */
function loadImage(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ img, url, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Berkas tidak bisa dibuka sebagai gambar (mungkin rusak)."));
    };
    img.src = url;
  });
}

type Quality = { level: "good" | "ok" | "low"; text: string };

/**
 * Menilai ketajaman: berapa piksel asli yang membentang di seluruh lebar bingkai
 * dibanding lebar hasil yang diinginkan.
 */
function judgeQuality(sourcePxAcrossFrame: number, target: number): Quality {
  const ratio = sourcePxAcrossFrame / target;
  if (ratio >= 0.9) {
    return { level: "good", text: "Ketajaman bagus untuk bingkai ini." };
  }
  if (ratio >= 0.5) {
    return {
      level: "ok",
      text: "Cukup tajam, tapi tampak sedikit lembut di layar besar.",
    };
  }
  return {
    level: "low",
    text: "Resolusi terlalu rendah untuk bingkai ini — hasil bisa buram. Kurangi zoom atau pakai foto yang lebih besar.",
  };
}

/**
 * Dialog atur-foto ala foto profil: geser dan zoom gambar di dalam bingkai
 * berbentuk sesuai pemakaian, lalu hasilnya dipotong, diberi latar putih bila
 * ada sisa ruang, dan dikompres ke WebP.
 */
export function ImageCropper({
  file,
  aspect,
  outputWidth,
  title,
  minSide = MIN_SOURCE_SIDE,
  transparent = false,
  onConfirm,
  onCancel,
}: {
  file: File | null;
  /** Lebar dibagi tinggi bingkai hasil */
  aspect: number;
  /** Lebar hasil akhir dalam piksel */
  outputWidth: number;
  title: string;
  /** Sisi terpendek gambar sumber yang masih diterima */
  minSide?: number;
  /** Sisa ruang dibiarkan transparan (untuk ikon) alih-alih diisi putih */
  transparent?: boolean;
  onConfirm: (result: File) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Ukuran bingkai di layar (px)
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(0);
  const frameH = frameW / aspect;

  // Geseran/zoom dari pengguna; null = posisi awal (isi penuh bingkai, di tengah)
  const [userScale, setUserScale] = useState<number | null>(null);
  const [userCenter, setUserCenter] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  // Komponen ini dipasang ulang (key) untuk tiap berkas, jadi state awal selalu bersih
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let created: Loaded | null = null;
    loadImage(file).then(
      (result) => {
        if (cancelled) {
          URL.revokeObjectURL(result.url);
          return;
        }
        created = result;
        setLoaded(result);
      },
      (error: Error) => !cancelled && setLoadError(error.message),
    );
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created.url);
    };
  }, [file]);

  // ResizeObserver langsung memanggil callback sekali saat mulai mengamati
  useLayoutEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setFrameW(node.clientWidth));
    observer.observe(node);
    return () => observer.disconnect();
  }, [loaded]);

  const bounds = useMemo(() => {
    if (!loaded || !frameW) return null;
    const cover = Math.max(frameW / loaded.width, frameH / loaded.height);
    const contain = Math.min(frameW / loaded.width, frameH / loaded.height);
    return { cover, contain, max: Math.max(cover, contain) * MAX_ZOOM };
  }, [loaded, frameW, frameH]);

  /** Jaga agar gambar tidak meninggalkan celah di bingkai (kecuali sengaja diperkecil) */
  function clampCenter(x: number, y: number, s: number) {
    if (!loaded) return { x, y };
    const halfW = frameW / 2 / s;
    const halfH = frameH / 2 / s;
    return {
      x: loaded.width * s <= frameW ? loaded.width / 2 : Math.min(Math.max(x, halfW), loaded.width - halfW),
      y: loaded.height * s <= frameH ? loaded.height / 2 : Math.min(Math.max(y, halfH), loaded.height - halfH),
    };
  }

  const scale = userScale ?? bounds?.cover ?? 1;
  const center = userCenter ?? {
    x: (loaded?.width ?? 0) / 2,
    y: (loaded?.height ?? 0) / 2,
  };

  function applyScale(next: number) {
    if (!bounds) return;
    const s = Math.min(Math.max(next, bounds.contain), bounds.max);
    setUserScale(s);
    setUserCenter(clampCenter(center.x, center.y, s));
  }

  function onPointerDown(event: React.PointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY };
  }
  function onPointerMove(event: React.PointerEvent) {
    if (!drag.current) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    drag.current = { x: event.clientX, y: event.clientY };
    setUserCenter(clampCenter(center.x - dx / scale, center.y - dy / scale, scale));
  }
  function onKeyDown(event: React.KeyboardEvent) {
    const step = 20 / scale;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    setUserCenter(clampCenter(center.x + move[0], center.y + move[1], scale));
  }

  const small = loaded ? Math.min(loaded.width, loaded.height) < minSide : false;
  const quality: Quality | null =
    loaded && frameW ? judgeQuality(frameW / scale, outputWidth) : null;
  const gap =
    loaded && frameW
      ? loaded.width * scale < frameW - 1 || loaded.height * scale < frameH - 1
      : false;

  async function confirm() {
    if (!loaded || !frameW || busy) return;
    setBusy(true);
    try {
      const outW = outputWidth;
      const outH = Math.round(outputWidth / aspect);
      const ratio = outW / frameW;
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Browser tidak mendukung pengolahan gambar.");
      if (!transparent) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, outW, outH);
      }
      ctx.imageSmoothingQuality = "high";
      const left = frameW / 2 - center.x * scale;
      const top = frameH / 2 - center.y * scale;
      ctx.drawImage(
        loaded.img,
        left * ratio,
        top * ratio,
        loaded.width * scale * ratio,
        loaded.height * scale * ratio,
      );
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.85),
      );
      if (!blob) throw new Error("Gagal membuat gambar hasil.");
      const base = file?.name.replace(/\.[^.]+$/, "") || "gambar";
      await onConfirm(new File([blob], `${base}.webp`, { type: "image/webp" }));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal memproses gambar.");
    } finally {
      setBusy(false);
    }
  }

  const left = loaded ? frameW / 2 - center.x * scale : 0;
  const top = loaded ? frameH / 2 - center.y * scale : 0;

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && !busy && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Geser gambar dan atur zoom sampai pas di bingkai. Yang terlihat di
            bingkai adalah hasil akhirnya.
          </DialogDescription>
        </DialogHeader>

        {loadError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {!loaded && !loadError && (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-label="Memuat gambar" />
          </div>
        )}

        {loaded && (
          <div className="space-y-3">
            <div
              ref={frameRef}
              role="application"
              aria-label="Bingkai gambar. Seret atau gunakan tombol panah untuk menggeser."
              tabIndex={0}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => (drag.current = null)}
              onPointerCancel={() => (drag.current = null)}
              onKeyDown={onKeyDown}
              onWheel={(event) => applyScale(scale * (event.deltaY < 0 ? 1.06 : 1 / 1.06))}
              style={{
                aspectRatio: aspect,
                ...(transparent
                  ? {
                      backgroundImage:
                        "conic-gradient(#e5e5e5 25%, #fff 0 50%, #e5e5e5 0 75%, #fff 0)",
                      backgroundSize: "16px 16px",
                    }
                  : {}),
              }}
              className="relative w-full cursor-grab touch-none select-none overflow-hidden rounded-lg border bg-white outline-none active:cursor-grabbing focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loaded.url}
                alt=""
                draggable={false}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width: loaded.width * scale,
                  height: loaded.height * scale,
                  maxWidth: "none",
                }}
              />
              {/* garis bantu sepertiga */}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-dashed border-foreground/30" />
                ))}
              </div>
            </div>

            {bounds && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => applyScale(bounds.contain)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Tampilkan seluruh gambar"
                  title="Tampilkan seluruh gambar (sisa ruang diisi putih)"
                >
                  <Minimize2 className="size-4" aria-hidden="true" />
                </button>
                <input
                  type="range"
                  aria-label="Zoom"
                  min={bounds.contain}
                  max={bounds.max}
                  step={(bounds.max - bounds.contain) / 200 || 0.001}
                  value={scale}
                  onChange={(event) => applyScale(Number(event.target.value))}
                  className="h-2 flex-1 accent-primary"
                />
                <button
                  type="button"
                  onClick={() => applyScale(bounds.cover)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Isi penuh bingkai"
                  title="Isi penuh bingkai"
                >
                  <Maximize2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}

            <ul className="space-y-1.5 text-xs">
              <li className="text-muted-foreground">
                Gambar asli {loaded.width}×{loaded.height} px
                {file ? ` · ${file.size >= 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`}` : ""}. Hasil{" "}
                {outputWidth}×{Math.round(outputWidth / aspect)} px, format WebP.
              </li>
              {small && (
                <li className="flex items-start gap-1.5 text-destructive">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  Gambar terlalu kecil (sisi terpendek di bawah {minSide} px).
                  Pakai foto yang lebih besar.
                </li>
              )}
              {!small && quality && (
                <li
                  className={
                    quality.level === "good"
                      ? "flex items-start gap-1.5 text-emerald-700"
                      : quality.level === "ok"
                        ? "flex items-start gap-1.5 text-amber-700"
                        : "flex items-start gap-1.5 text-destructive"
                  }
                >
                  {quality.level === "good" ? (
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  )}
                  {quality.text}
                </li>
              )}
              {gap && (
                <li className="text-muted-foreground">
                  Ada sisa ruang di bingkai; akan {transparent ? "dibiarkan transparan" : "diisi warna putih"}.
                </li>
              )}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Batal
          </Button>
          <Button type="button" onClick={confirm} disabled={!loaded || small || busy}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {busy ? "Memproses…" : "Pakai gambar ini"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

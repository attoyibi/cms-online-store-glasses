"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";

import {
  isPreviewMessage,
  type EditorMessage,
} from "@/lib/blocks/preview-protocol";
import type { Block } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "phone";

/**
 * Lebar jendela yang "dibayangkan" tiap perangkat. Iframe dibuat selebar ini
 * lalu diperkecil dengan CSS agar muat di panel — dengan begitu breakpoint
 * Tailwind (yang mengikuti lebar jendela, bukan lebar panel) bekerja seperti
 * di perangkat sungguhan.
 */
const DEVICES: { id: Device; label: string; width: number; icon: typeof Monitor }[] = [
  { id: "desktop", label: "Desktop", width: 1280, icon: Monitor },
  { id: "tablet", label: "Tablet", width: 820, icon: Tablet },
  { id: "phone", label: "HP", width: 390, icon: Smartphone },
];

const LOAD_TIMEOUT_MS = 20000;
/** Panel lebih sempit dari ini = layar HP; mode Desktop terlalu kecil untuk dibaca */
const NARROW_PANEL_PX = 520;

export function PreviewPane({
  src,
  blocks,
  selectedId,
  scrollRequest,
  onSelect,
  onUndo,
  onRedo,
}: {
  src: string;
  blocks: Block[];
  selectedId: string | null;
  /** Naikkan `n` untuk meminta pratinjau menggulir ke blok `id` */
  scrollRequest: { id: string; n: number } | null;
  onSelect: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<Device>("desktop");
  // Pilihan manual admin tidak boleh ditimpa oleh pilihan otomatis
  const choseDevice = useRef(false);
  const autoChecked = useRef(false);
  const [box, setBox] = useState({ width: 0, height: 0 });
  // Naik setiap kali iframe melapor siap (termasuk setelah dimuat ulang)
  const [readyCount, setReadyCount] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Ukuran panel, untuk menghitung skala
  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ width, height });

      // Pengukuran pertama: di layar sempit langsung pakai mode HP
      if (!autoChecked.current && width > 0) {
        autoChecked.current = true;
        if (width < NARROW_PANEL_PX && !choseDevice.current) setDevice("phone");
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Pesan dari pratinjau: siap, pilih blok, undo/redo
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isPreviewMessage(event.data)) return;

      switch (event.data.type) {
        case "ready":
          setReadyCount((count) => count + 1);
          setTimedOut(false);
          break;
        case "select":
          onSelect(event.data.id);
          break;
        case "undo":
          onUndo();
          break;
        case "redo":
          onRedo();
          break;
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onSelect, onUndo, onRedo]);

  const send = useCallback((message: EditorMessage) => {
    iframeRef.current?.contentWindow?.postMessage(
      message,
      window.location.origin,
    );
  }, []);

  // Kirim keadaan terbaru ke pratinjau setiap ada perubahan
  useEffect(() => {
    if (readyCount === 0) return;
    send({ source: "lensara-editor", type: "state", blocks, selectedId });
  }, [blocks, selectedId, readyCount, send]);

  useEffect(() => {
    if (readyCount === 0 || !scrollRequest) return;
    send({ source: "lensara-editor", type: "scroll", id: scrollRequest.id });
  }, [scrollRequest, readyCount, send]);

  // Bila pratinjau tidak pernah melapor siap, beri jalan keluar
  useEffect(() => {
    if (readyCount > 0) return;
    const timer = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [readyCount, reloadKey]);

  const current = DEVICES.find((item) => item.id === device) ?? DEVICES[0];
  const scale =
    box.width > 0 ? Math.min(1, box.width / current.width) : 1;
  const ready = readyCount > 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b bg-card px-3 py-2">
        <div
          role="radiogroup"
          aria-label="Ukuran pratinjau"
          className="flex items-center gap-1"
        >
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={device === id}
              onClick={() => {
                choseDevice.current = true;
                setDevice(id);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                device === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">
          Klik bagian mana pun untuk mengeditnya
        </span>
      </div>

      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden">
        {box.width > 0 && (
          <div
            className={cn(
              "mx-auto h-full overflow-hidden bg-background",
              device === "phone" && "shadow-lg ring-1 ring-border",
            )}
            style={{ width: current.width * scale }}
          >
            <iframe
              key={reloadKey}
              ref={iframeRef}
              src={src}
              title="Pratinjau halaman depan"
              className="block border-0 bg-background"
              style={{
                width: current.width,
                height: box.height / scale,
                transform: `scale(${scale})`,
                transformOrigin: "0 0",
              }}
            />
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 text-sm text-muted-foreground">
            {timedOut ? (
              <>
                <p>Pratinjau tidak merespons.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTimedOut(false);
                    setReloadKey((key) => key + 1);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Muat ulang pratinjau
                </button>
              </>
            ) : (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Memuat pratinjau…
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

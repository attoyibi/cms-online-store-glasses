"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type Slide = { src: string; alt: string };

const INTERVAL_MS = 5000;

/**
 * Slider gambar hero: bergantian memudar, titik penanda di bawah, berhenti
 * saat kursor di atasnya, dan tidak berjalan sendiri bila pengunjung
 * memilih mengurangi animasi.
 */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % count),
      INTERVAL_MS,
    );
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div
      className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-ink-foreground/15 bg-card shadow-2xl shadow-black/30"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          priority={i === 0}
          unoptimized={slide.src.toLowerCase().endsWith(".svg")}
          aria-hidden={i !== index}
          className={cn(
            "object-cover transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Tampilkan gambar ${i + 1} dari ${count}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-foreground/30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

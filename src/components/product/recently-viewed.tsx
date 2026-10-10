"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";

import { ProductImage } from "@/components/product/product-image";
import { formatPrice } from "@/lib/format";
import {
  getServerSnapshot,
  getSnapshot,
  recordView,
  subscribe,
  type RecentItem,
} from "@/lib/recent-store";

/**
 * Mencatat produk yang sedang dibuka lalu menampilkan beberapa yang
 * dilihat sebelumnya. Hanya terisi dari perangkat pengunjung sendiri,
 * jadi tidak muncul sama sekali pada kunjungan pertama.
 */
export function RecentlyViewed({ current }: { current: RecentItem }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const { slug, name, image, price, priceMax } = current;
  useEffect(() => {
    recordView({ slug, name, image, price, priceMax });
  }, [slug, name, image, price, priceMax]);

  const others = items.filter((item) => item.slug !== slug).slice(0, 4);
  if (others.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="text-lg font-semibold sm:text-xl">
        Terakhir Anda lihat
      </h2>
      <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {others.map((item) => (
          <li key={item.slug}>
            <Link href={`/produk/${item.slug}`} className="group block">
              <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  sizes="(min-width: 640px) 20vw, 45vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug">
                {item.name}
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {item.price === item.priceMax
                  ? formatPrice(item.price)
                  : `${formatPrice(item.price)} – ${formatPrice(item.priceMax)}`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

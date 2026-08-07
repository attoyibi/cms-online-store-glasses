"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  FILTER_KEYS,
  FILTER_PARAM,
  parseFilters,
  type CatalogFilters,
} from "@/lib/filters";

/**
 * Membaca dan mengubah filter lewat query string.
 *
 * Semua state filter tinggal di URL, bukan di state React, supaya hasil
 * penyaringan bisa dibagikan, di-bookmark, dan tombol back browser tetap
 * bekerja seperti yang diharapkan.
 */
export function useCatalogFilters(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = parseFilters(
    Object.fromEntries(searchParams.entries()) as Record<string, string>,
  );

  const push = useCallback(
    (next: CatalogFilters) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const key of FILTER_KEYS) {
        const values = next[key];
        if (values.length) params.set(FILTER_PARAM[key], values.join(","));
        else params.delete(FILTER_PARAM[key]);
      }

      const query = params.toString();
      startTransition(() =>
        router.push(query ? `${basePath}?${query}` : basePath, {
          scroll: false,
        }),
      );
    },
    [basePath, router, searchParams],
  );

  const toggle = useCallback(
    (key: keyof CatalogFilters, slug: string) => {
      const current = filters[key];
      push({
        ...filters,
        [key]: current.includes(slug)
          ? current.filter((item) => item !== slug)
          : [...current, slug],
      });
    },
    [filters, push],
  );

  const clearGroup = useCallback(
    (key: keyof CatalogFilters) => push({ ...filters, [key]: [] }),
    [filters, push],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) params.delete(FILTER_PARAM[key]);

    const query = params.toString();
    startTransition(() =>
      router.push(query ? `${basePath}?${query}` : basePath, { scroll: false }),
    );
  }, [basePath, router, searchParams]);

  return { filters, toggle, clearGroup, clearAll, isPending };
}

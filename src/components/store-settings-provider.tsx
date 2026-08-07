"use client";

import { createContext, useContext } from "react";

import type { StoreSettings } from "@/lib/types";

const StoreSettingsContext = createContext<StoreSettings | null>(null);

/**
 * Pengaturan toko diambil sekali di root layout (server) lalu dibagikan
 * ke komponen client yang membutuhkannya — terutama nomor WhatsApp.
 */
export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext value={settings}>{children}</StoreSettingsContext>
  );
}

export function useStoreSettings() {
  const settings = useContext(StoreSettingsContext);
  if (!settings) {
    throw new Error(
      "useStoreSettings harus dipakai di dalam <StoreSettingsProvider>",
    );
  }
  return settings;
}

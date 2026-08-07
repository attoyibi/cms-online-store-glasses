"use client";

import { useEffect, useState } from "react";

import { WhatsAppIcon } from "@/components/icons";
import { useStoreSettings } from "@/components/store-settings-provider";
import { waLink } from "@/lib/whatsapp";

/**
 * Tombol WhatsApp mengambang. Baru muncul setelah pengunjung menggulir
 * sedikit agar tidak menutupi hero saat halaman pertama dibuka.
 */
export function WhatsAppFloat() {
  const settings = useStoreSettings();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const href = waLink(
    settings.whatsapp_number,
    `Halo ${settings.store_name}, saya mau konsultasi soal kacamata.`,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat WhatsApp"
      data-visible={visible}
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-whatsapp py-3 pl-3.5 pr-4 text-white shadow-lg shadow-black/15 transition-all duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-whatsapp data-[visible=false]:pointer-events-none data-[visible=false]:translate-y-4 data-[visible=false]:opacity-0"
    >
      <WhatsAppIcon className="size-5 shrink-0" />
      <span className="hidden text-sm font-medium sm:inline">Chat Kami</span>
    </a>
  );
}

"use client";

import { MessageCircle } from "lucide-react";

import { useStoreSettings } from "@/components/store-settings-provider";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/whatsapp";

/**
 * Tombol yang membuka WhatsApp dengan pesan yang sudah terisi.
 * `message` boleh memakai `{store}` sebagai penanda nama toko.
 */
export function WhatsAppButton({
  message = "Halo {store}, saya mau konsultasi soal kacamata.",
  label = "Konsultasi WhatsApp",
  size = "default",
  variant = "outline",
  className,
  showIcon = true,
}: {
  message?: string;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
  className?: string;
  showIcon?: boolean;
}) {
  const settings = useStoreSettings();
  const href = waLink(
    settings.whatsapp_number,
    message.replaceAll("{store}", settings.store_name),
  );

  return (
    <Button asChild size={size} variant={variant} className={className}>
      <a href={href} target="_blank" rel="noreferrer">
        {showIcon && <MessageCircle className="size-4" aria-hidden="true" />}
        {label}
      </a>
    </Button>
  );
}

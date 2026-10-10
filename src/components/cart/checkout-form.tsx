"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { WhatsAppIcon } from "@/components/icons";
import { useStoreSettings } from "@/components/store-settings-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/format";
import { lineId } from "@/lib/variants";
import { buildOrderMessage, waLink, type CheckoutDetails } from "@/lib/whatsapp";

type Errors = Partial<Record<keyof CheckoutDetails, string>>;

export function CheckoutForm() {
  const { items, total, ready, clear } = useCart();
  const settings = useStoreSettings();

  const [details, setDetails] = useState<CheckoutDetails>({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const next: Errors = {};
    if (!details.name.trim()) next.name = "Nama wajib diisi";
    if (!details.phone.trim()) {
      next.phone = "Nomor HP wajib diisi";
    } else if (details.phone.replace(/\D/g, "").length < 9) {
      next.phone = "Nomor HP sepertinya belum lengkap";
    }
    if (!details.address.trim()) next.address = "Alamat wajib diisi";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const url = waLink(
      settings.whatsapp_number,
      buildOrderMessage(items, settings.store_name, details),
    );

    // Dibuka lebih dulu agar tidak diblokir popup blocker,
    // baru keranjang dikosongkan.
    window.open(url, "_blank", "noopener,noreferrer");
    clear();
  }

  if (!ready) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <ShoppingBag
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="font-medium">Keranjang Anda kosong</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Pilih produk dulu sebelum mengirim pesanan.
        </p>
        <Button asChild className="mt-2">
          <Link href="/produk">Lihat Katalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nama lengkap</Label>
          <Input
            id="name"
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            placeholder="Muhammad Muchson"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={details.phone}
            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            placeholder="0812xxxxxxx"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-xs text-destructive">
              {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat pengiriman</Label>
          <textarea
            id="address"
            rows={3}
            value={details.address}
            onChange={(e) =>
              setDetails({ ...details, address: e.target.value })
            }
            placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20"
          />
          {errors.address && (
            <p id="address-error" className="text-xs text-destructive">
              {errors.address}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">
            Catatan{" "}
            <span className="font-normal text-muted-foreground">
              (opsional)
            </span>
          </Label>
          <textarea
            id="note"
            rows={2}
            value={details.note}
            onChange={(e) => setDetails({ ...details, note: e.target.value })}
            placeholder="Ukuran lensa, warna yang diinginkan, atau permintaan lain"
            className="flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <div className="rounded-xl border bg-secondary/60 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Data ini tidak disimpan di server mana pun — hanya disusun menjadi
            teks pesan WhatsApp di perangkat Anda. Ongkos kirim dan cara
            pembayaran dibahas langsung dengan kami di chat.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full gap-2">
          <WhatsAppIcon />
          Kirim Pesanan ke WhatsApp
        </Button>

        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href="/produk">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Lanjut belanja
          </Link>
        </Button>
      </form>

      <aside className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold">Ringkasan Pesanan</h2>

        <ul className="mt-4 divide-y">
          {items.map((item) => (
            <li key={lineId(item)} className="flex gap-3 py-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="56px"
                    unoptimized={item.image.endsWith(".svg")}
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                {item.variantLabel && (
                  <p className="text-xs text-muted-foreground">
                    {item.variantLabel}
                  </p>
                )}
                <p className="text-xs text-muted-foreground tabular-nums">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="text-sm font-medium tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Belum termasuk ongkos kirim.
          </p>
        </div>
      </aside>
    </div>
  );
}

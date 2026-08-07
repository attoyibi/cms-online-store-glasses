"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { useStoreSettings } from "@/components/store-settings-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";

export function CartSheet() {
  const { items, total, count, isOpen, setOpen, remove, setQuantity, clear } =
    useCart();
  const settings = useStoreSettings();

  const quickOrderUrl = waLink(
    settings.whatsapp_number,
    buildOrderMessage(items, settings.store_name),
  );

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="text-base">
            Keranjang{count > 0 && ` (${count})`}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Daftar produk yang akan dipesan lewat WhatsApp
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <ShoppingBag
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="font-medium">Keranjang masih kosong</p>
            <p className="max-w-64 text-sm text-muted-foreground">
              Pilih frame atau lensa dulu, nanti pesanannya dikirim ke WhatsApp
              kami.
            </p>
            <Button asChild className="mt-2" onClick={() => setOpen(false)}>
              <Link href="/produk">Lihat Produk</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-3.5 py-4">
                  <Link
                    href={`/produk/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-muted"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        unoptimized={item.image.endsWith(".svg")}
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <Link
                      href={`/produk/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <div className="mt-auto flex items-center gap-2">
                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity - 1)
                          }
                          className="flex size-8 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Kurangi jumlah ${item.name}`}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(item.productId, item.quantity + 1)
                          }
                          className="flex size-8 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={`Tambah jumlah ${item.name}`}
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Hapus ${item.name} dari keranjang`}
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <SheetFooter className="gap-3 border-t px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ongkos kirim dihitung terpisah saat konfirmasi di WhatsApp.
              </p>

              <Button asChild size="lg" className="w-full">
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Lanjut Pesan
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  <a href={quickOrderUrl} target="_blank" rel="noreferrer">
                    Langsung ke WhatsApp
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clear}
                  className="text-muted-foreground"
                >
                  Kosongkan
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

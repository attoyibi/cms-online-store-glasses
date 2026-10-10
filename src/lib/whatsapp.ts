import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";

/** Buang spasi, tanda hubung, dan ubah awalan 0/+62 menjadi 62 */
export function normalizeWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function waLink(number: string, message: string): string {
  return `https://wa.me/${normalizeWaNumber(number)}?text=${encodeURIComponent(message)}`;
}

export type CheckoutDetails = {
  name: string;
  phone: string;
  address: string;
  note?: string;
};

/**
 * Menyusun pesan pesanan yang dikirim ke WhatsApp toko.
 * Situs ini tidak memproses pembayaran — seluruh transaksi dilanjutkan di WA.
 */
export function buildOrderMessage(
  items: CartItem[],
  storeName: string,
  details?: CheckoutDetails,
): string {
  const lines: string[] = [
    `Halo ${storeName}, saya mau pesan:`,
    "",
    ...items.map((item, index) => {
      const subtotal = item.price * item.quantity;
      return [
        `${index + 1}. ${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ""}`,
        `   ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(subtotal)}`,
      ].join("\n");
    }),
    "",
    `Total: ${formatPrice(cartTotal(items))}`,
  ];

  if (details) {
    lines.push(
      "",
      "--- Data Pemesan ---",
      `Nama: ${details.name}`,
      `No. HP: ${details.phone}`,
      `Alamat: ${details.address}`,
    );
    if (details.note?.trim()) {
      lines.push(`Catatan: ${details.note.trim()}`);
    }
  }

  lines.push("", "Mohon informasi ongkir dan cara pembayarannya. Terima kasih.");
  return lines.join("\n");
}

export function buildProductInquiry(
  productName: string,
  storeName: string,
  url?: string,
): string {
  const lines = [
    `Halo ${storeName}, saya tertarik dengan produk "${productName}".`,
  ];
  if (url) lines.push(url);
  lines.push("Apakah stoknya masih tersedia?");
  return lines.join("\n");
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

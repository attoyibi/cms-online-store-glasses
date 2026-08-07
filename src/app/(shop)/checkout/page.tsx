import type { Metadata } from "next";

import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata: Metadata = {
  title: "Kirim Pesanan",
  description:
    "Lengkapi data pengiriman, lalu kirim pesanan Anda ke WhatsApp kami untuk dikonfirmasi.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <header className="max-w-xl space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">Kirim Pesanan</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Isi data di bawah ini, lalu tekan tombol kirim. Rincian pesanan akan
          tersusun otomatis menjadi pesan WhatsApp — Anda masih bisa
          mengubahnya sebelum menekan kirim di aplikasi WhatsApp.
        </p>
      </header>

      <div className="mt-9">
        <CheckoutForm />
      </div>
    </div>
  );
}

import { MessageCircle, PackageCheck, ShoppingBag, Wallet } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Pilih produk",
    body: "Masukkan frame atau lensa yang Anda suka ke keranjang. Boleh lebih dari satu.",
  },
  {
    icon: MessageCircle,
    title: "Kirim ke WhatsApp",
    body: "Tekan Lanjut Pesan. Rincian pesanan dan total harga otomatis tersusun jadi pesan.",
  },
  {
    icon: Wallet,
    title: "Konfirmasi & bayar",
    body: "Kami balas dengan ongkir dan cara pembayaran. Pembayaran dilakukan di luar situs ini.",
  },
  {
    icon: PackageCheck,
    title: "Dikirim",
    body: "Pesanan diproses hari itu juga bila stok tersedia, lalu nomor resi kami kirimkan.",
  },
];

export function HowToOrder() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="max-w-2xl space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Cara Pesan
        </p>
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Empat langkah, tidak perlu buat akun
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Situs ini tidak memproses pembayaran. Semua transaksi diselesaikan
          lewat WhatsApp supaya Anda bisa bertanya dulu sebelum membayar.
        </p>
      </div>

      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="relative">
            {/* Garis penghubung antar langkah di layar lebar */}
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-11 top-5 hidden h-px w-[calc(100%-1.5rem)] bg-border lg:block"
              />
            )}

            <div className="relative space-y-3">
              <span className="relative z-10 flex size-10 items-center justify-center rounded-xl border bg-card text-primary shadow-sm">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold">
                  <span className="mr-1.5 text-muted-foreground tabular-nums">
                    {index + 1}.
                  </span>
                  {title}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

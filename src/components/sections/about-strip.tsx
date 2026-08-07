import Image from "next/image";

import { WhatsAppButton } from "@/components/whatsapp-button";

const points = [
  "Frame diseleksi langsung, bukan dropship",
  "Resep lensa bisa dikirim dari hasil periksa optik mana pun",
  "Pemasangan lensa dikerjakan di lab sendiri",
];

export function AboutStrip() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="grid items-center gap-10 rounded-3xl border bg-sand p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
        <div className="relative order-last aspect-4/3 overflow-hidden rounded-2xl bg-muted lg:order-first">
          <Image
            src="/products/round-sand.svg"
            alt="Frame bundar warna pasir"
            fill
            sizes="(min-width: 1024px) 40vw, 90vw"
            unoptimized
            className="object-cover"
          />
        </div>

        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Tentang Kami
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Optik kecil dari Jogja yang tidak suka menjual barang asal-asalan
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Kami mulai dari satu gerai kecil di Kaliurang. Sampai sekarang
            prinsipnya tidak berubah: setiap frame dicoba dulu sebelum masuk
            katalog, dan setiap pertanyaan dijawab apa adanya — termasuk kalau
            jawabannya adalah &ldquo;model ini kurang cocok untuk wajah
            Anda&rdquo;.
          </p>

          <ul className="space-y-2.5 pt-1">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>

          <div className="pt-3">
            <WhatsAppButton
              variant="default"
              message="Halo {store}, saya mau konsultasi soal pilihan frame."
              label="Konsultasi Sekarang"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

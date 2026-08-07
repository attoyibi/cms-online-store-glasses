import { Star } from "lucide-react";

const reviews = [
  {
    name: "Rani P.",
    city: "Bantul",
    body: "Awalnya ragu beli kacamata online. Ternyata dibantu sampai detail — dikasih tahu frame yang saya incar terlalu lebar untuk wajah saya, lalu direkomendasikan yang lain. Pas banget.",
  },
  {
    name: "Bagas W.",
    city: "Surabaya",
    body: "Pesan Jumat sore, Senin sudah sampai. Lensa progresifnya nyaman, dan sempat ditanya ulang soal ukuran karena ada angka yang aneh di resep saya. Teliti.",
  },
  {
    name: "Siti H.",
    city: "Makassar",
    body: "Harga di website sama dengan yang dikonfirmasi di WhatsApp, tidak ada biaya tambahan mendadak. Kemasannya juga rapi, dapat hard case dan lap.",
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="max-w-2xl space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Testimoni
        </p>
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Yang dikatakan pelanggan
        </h2>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {reviews.map((review) => (
          <figure
            key={review.name}
            className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex gap-0.5" aria-label="Penilaian 5 dari 5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className="size-3.5 fill-primary text-primary"
                  aria-hidden="true"
                />
              ))}
            </div>

            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
              {review.body}
            </blockquote>

            <figcaption className="mt-5 border-t pt-4 text-sm">
              <span className="font-medium">{review.name}</span>
              <span className="text-muted-foreground"> — {review.city}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

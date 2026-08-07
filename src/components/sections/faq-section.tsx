import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppButton } from "@/components/whatsapp-button";

const faqs = [
  {
    q: "Apakah bisa bayar lewat website ini?",
    a: "Tidak. Website ini hanya untuk memilih produk. Setelah menekan Lanjut Pesan, rincian pesanan dikirim ke WhatsApp kami, lalu pembayaran diatur di sana — transfer bank, e-wallet, atau bayar di toko.",
  },
  {
    q: "Saya tidak punya hasil periksa mata, bagaimana?",
    a: "Bisa datang ke toko kami di Jogja untuk periksa gratis. Kalau di luar kota, Anda bisa periksa di optik terdekat lalu kirimkan fotonya ke WhatsApp kami — kami hanya butuh angka SPH, CYL, AXIS, dan PD.",
  },
  {
    q: "Berapa lama pesanan sampai?",
    a: "Frame tanpa lensa resep biasanya dikirim di hari yang sama. Kalau pakai lensa resep, pengerjaan 2–4 hari kerja tergantung tipe lensanya, baru dikirim.",
  },
  {
    q: "Kalau ukurannya tidak cocok, bisa tukar?",
    a: "Frame bisa ditukar dalam 7 hari selama belum dipasangi lensa resep dan kondisinya masih seperti semula. Lensa resep tidak bisa ditukar karena dibuat khusus, tapi kalau ada kesalahan dari kami, kami ganti tanpa biaya.",
  },
  {
    q: "Apakah ada garansi?",
    a: "Ada, 1 tahun untuk kerusakan frame karena cacat produksi dan pengelupasan lapisan lensa. Tidak termasuk lensa pecah, tergores karena pemakaian, atau frame patah karena terjatuh.",
  },
];

export function FaqSection() {
  return (
    <section className="container-page py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Pertanyaan Umum
          </p>
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Hal yang paling sering ditanyakan
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Tidak ketemu jawabannya? Tanya langsung, dijawab orang asli — bukan
            bot.
          </p>
          <WhatsAppButton
            message="Halo {store}, saya mau bertanya:"
            label="Tanya Lewat WhatsApp"
          />
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.q} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-sm font-medium">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

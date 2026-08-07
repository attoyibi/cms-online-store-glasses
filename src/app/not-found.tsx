import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold sm:text-3xl">
        Halaman ini tidak ada
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Mungkin produknya sudah tidak dijual, atau alamatnya salah ketik. Coba
        kembali ke katalog untuk melihat koleksi terbaru.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button asChild>
          <Link href="/produk">Lihat Katalog</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}

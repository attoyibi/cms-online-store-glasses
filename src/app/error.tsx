"use client"; // Error boundary wajib Client Component

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-32 text-center">
      <p className="font-mono text-sm text-muted-foreground">Error</p>
      <h1 className="text-2xl font-semibold sm:text-3xl">
        Terjadi kesalahan di sisi kami
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Halaman ini gagal dimuat. Coba lagi sebentar, atau kembali ke beranda.
        Kalau terus berulang, hubungi kami lewat WhatsApp.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Button onClick={() => retry()}>Coba Lagi</Button>
        <Button asChild variant="outline">
          <Link href="/">Ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}

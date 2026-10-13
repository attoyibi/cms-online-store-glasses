import Script from "next/script";

const GA4 = /^G-[A-Z0-9]{6,14}$/;
const PIXEL = /^\d{8,20}$/;

/**
 * Pelacakan pengunjung (GA4 dan Meta Pixel), diisi dari Admin → SEO & Toko.
 *
 * - Hanya aktif di production, supaya kunjungan saat pengembangan dan
 *   pratinjau tidak mengotori data.
 * - ID divalidasi ulang di sini walau sudah divalidasi saat disimpan: nilai
 *   ini disisipkan ke dalam skrip, jadi tidak boleh mengandung apa pun
 *   selain bentuk ID yang sah.
 */
export function Analytics({
  ga4Id,
  metaPixelId,
}: {
  ga4Id: string | null;
  metaPixelId: string | null;
}) {
  if (process.env.NODE_ENV !== "production") return null;

  const ga4 = ga4Id && GA4.test(ga4Id) ? ga4Id : null;
  const pixel = metaPixelId && PIXEL.test(metaPixelId) ? metaPixelId : null;
  if (!ga4 && !pixel) return null;

  return (
    <>
      {ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}
      {pixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}

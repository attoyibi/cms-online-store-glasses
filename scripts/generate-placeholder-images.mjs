import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? "public/products";
mkdirSync(OUT, { recursive: true });

// Palet latar lembut + warna frame yang kontras terhadapnya
const tones = {
  sand: { bg: "#F4EFE6", glow: "#FBF8F2", frame: "#2F3A33", lens: "#DCD3C4" },
  jade: { bg: "#E4EDE7", glow: "#F1F6F2", frame: "#1F3A2E", lens: "#C9DCD0" },
  slate: { bg: "#E7EAEC", glow: "#F3F5F6", frame: "#26313A", lens: "#D0D7DC" },
  rose: { bg: "#F3E9E7", glow: "#FAF3F1", frame: "#3A2A28", lens: "#DFCBC7" },
  ink: { bg: "#22282B", glow: "#2E3639", frame: "#E8EDE9", lens: "#39433F" },
  amber: { bg: "#F5EDDC", glow: "#FCF7EC", frame: "#42331C", lens: "#E0CFAC" },
};

const CY = 520; // sumbu vertikal kacamata
const SW = 13; // ketebalan garis frame

/** Gagang kiri & kanan, digambar dari tepi luar lensa ke belakang telinga */
function temples(leftX, rightX, y) {
  return `
    <path d="M ${leftX} ${y} L ${leftX - 66} ${y - 18} L ${leftX - 96} ${y + 74}"
      fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M ${rightX} ${y} L ${rightX + 66} ${y - 18} L ${rightX + 96} ${y + 74}"
      fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
}

const shapes = {
  // Jari-jari dijaga agar kedua lensa tidak saling potong (jarak inner 20px)
  round: (t) => `
    <circle cx="278" cy="${CY}" r="112" fill="${t.lens}" />
    <circle cx="522" cy="${CY}" r="112" fill="${t.lens}" />
    <circle cx="278" cy="${CY}" r="112" fill="none" />
    <circle cx="522" cy="${CY}" r="112" fill="none" />
    <path d="M 390 ${CY - 24} Q 400 ${CY - 40} 410 ${CY - 24}" fill="none" stroke-linecap="round" />
    ${temples(166, 634, CY - 14)}`,

  rectangle: (t) => `
    <rect x="132" y="${CY - 86}" width="252" height="172" rx="34" fill="${t.lens}" />
    <rect x="416" y="${CY - 86}" width="252" height="172" rx="34" fill="${t.lens}" />
    <rect x="132" y="${CY - 86}" width="252" height="172" rx="34" fill="none" />
    <rect x="416" y="${CY - 86}" width="252" height="172" rx="34" fill="none" />
    <path d="M 384 ${CY - 44} L 416 ${CY - 44}" fill="none" stroke-linecap="round" />
    ${temples(132, 668, CY - 50)}`,

  cateye: (t) => {
    // Sudut luar-atas sengaja dibuat runcing dan terangkat — ciri khas cat-eye
    const left = `M 140 ${CY - 104}
      C 214 ${CY - 82} 322 ${CY - 78} 374 ${CY - 50}
      C 382 ${CY + 20} 320 ${CY + 90} 244 ${CY + 86}
      C 184 ${CY + 82} 150 ${CY + 36} 150 ${CY - 12}
      C 150 ${CY - 48} 144 ${CY - 82} 140 ${CY - 104} Z`;
    const right = `M 660 ${CY - 104}
      C 586 ${CY - 82} 478 ${CY - 78} 426 ${CY - 50}
      C 418 ${CY + 20} 480 ${CY + 90} 556 ${CY + 86}
      C 616 ${CY + 82} 650 ${CY + 36} 650 ${CY - 12}
      C 650 ${CY - 48} 656 ${CY - 82} 660 ${CY - 104} Z`;
    return `
    <path d="${left}" fill="${t.lens}" />
    <path d="${right}" fill="${t.lens}" />
    <path d="${left}" fill="none" stroke-linejoin="round" />
    <path d="${right}" fill="none" stroke-linejoin="round" />
    <path d="M 374 ${CY - 50} Q 400 ${CY - 66} 426 ${CY - 50}" fill="none" stroke-linecap="round" />
    ${temples(152, 648, CY - 44)}`;
  },

  aviator: (t) => `
    <path d="M 140 ${CY - 66} L 376 ${CY - 66} C 380 ${CY + 4} 330 ${CY + 96} 262 ${CY + 96}
             C 190 ${CY + 96} 142 ${CY + 12} 140 ${CY - 66} Z" fill="${t.lens}" />
    <path d="M 660 ${CY - 66} L 424 ${CY - 66} C 420 ${CY + 4} 470 ${CY + 96} 538 ${CY + 96}
             C 610 ${CY + 96} 658 ${CY + 12} 660 ${CY - 66} Z" fill="${t.lens}" />
    <path d="M 140 ${CY - 66} L 376 ${CY - 66} C 380 ${CY + 4} 330 ${CY + 96} 262 ${CY + 96}
             C 190 ${CY + 96} 142 ${CY + 12} 140 ${CY - 66} Z" fill="none" stroke-linejoin="round" />
    <path d="M 660 ${CY - 66} L 424 ${CY - 66} C 420 ${CY + 4} 470 ${CY + 96} 538 ${CY + 96}
             C 610 ${CY + 96} 658 ${CY + 12} 660 ${CY - 66} Z" fill="none" stroke-linejoin="round" />
    <path d="M 376 ${CY - 66} Q 400 ${CY - 34} 424 ${CY - 66}" fill="none" stroke-linecap="round" />
    <path d="M 376 ${CY - 88} L 424 ${CY - 88}" fill="none" stroke-width="9" stroke-linecap="round" />
    ${temples(140, 660, CY - 66)}`,

  browline: (t) => `
    <path d="M 146 ${CY - 62} L 380 ${CY - 62} C 380 ${CY + 26} 322 ${CY + 88} 254 ${CY + 88}
             C 186 ${CY + 88} 146 ${CY + 22} 146 ${CY - 62} Z" fill="${t.lens}" />
    <path d="M 654 ${CY - 62} L 420 ${CY - 62} C 420 ${CY + 26} 478 ${CY + 88} 546 ${CY + 88}
             C 614 ${CY + 88} 654 ${CY + 22} 654 ${CY - 62} Z" fill="${t.lens}" />
    <path d="M 146 ${CY - 62} L 380 ${CY - 62} C 380 ${CY + 26} 322 ${CY + 88} 254 ${CY + 88}
             C 186 ${CY + 88} 146 ${CY + 22} 146 ${CY - 62} Z" fill="none" stroke-linejoin="round" />
    <path d="M 654 ${CY - 62} L 420 ${CY - 62} C 420 ${CY + 26} 478 ${CY + 88} 546 ${CY + 88}
             C 614 ${CY + 88} 654 ${CY + 22} 654 ${CY - 62} Z" fill="none" stroke-linejoin="round" />
    <path d="M 130 ${CY - 66} L 670 ${CY - 66}" fill="none" stroke-width="26" stroke-linecap="round" />
    ${temples(146, 654, CY - 58)}`,

  square: (t) => `
    <rect x="128" y="${CY - 96}" width="256" height="192" rx="18" fill="${t.lens}" />
    <rect x="416" y="${CY - 96}" width="256" height="192" rx="18" fill="${t.lens}" />
    <rect x="128" y="${CY - 96}" width="256" height="192" rx="18" fill="none" stroke-width="18" />
    <rect x="416" y="${CY - 96}" width="256" height="192" rx="18" fill="none" stroke-width="18" />
    <path d="M 384 ${CY - 52} L 416 ${CY - 52}" fill="none" stroke-width="18" stroke-linecap="round" />
    ${temples(128, 672, CY - 62)}`,

  /** Untuk kategori "Lensa": satu lensa tunggal dengan pantulan cahaya */
  lens: (t) => `
    <circle cx="400" cy="${CY}" r="188" fill="${t.lens}" />
    <circle cx="400" cy="${CY}" r="188" fill="none" stroke-width="16" />
    <circle cx="400" cy="${CY}" r="140" fill="none" stroke-width="6" opacity="0.55" />
    <path d="M 300 ${CY - 92} A 132 132 0 0 1 396 ${CY - 128}" fill="none"
      stroke-width="16" stroke-linecap="round" opacity="0.85" />
    <path d="M 292 ${CY + 60} A 132 132 0 0 0 348 ${CY + 118}" fill="none"
      stroke-width="10" stroke-linecap="round" opacity="0.5" />`,
};

function svg(shapeName, toneName) {
  const t = tones[toneName];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img" aria-label="Ilustrasi kacamata ${shapeName}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="72%">
      <stop offset="0%" stop-color="${t.glow}" />
      <stop offset="100%" stop-color="${t.bg}" />
    </radialGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)" />
  <ellipse cx="400" cy="${CY + 210}" rx="230" ry="26" fill="${t.frame}" opacity="0.08" />
  <g stroke="${t.frame}" stroke-width="${SW}">
    ${shapes[shapeName](t)}
  </g>
</svg>
`;
}

const combos = [
  ["round", "sand"],
  ["round", "ink"],
  ["rectangle", "slate"],
  ["rectangle", "jade"],
  ["cateye", "rose"],
  ["cateye", "sand"],
  ["aviator", "amber"],
  ["aviator", "ink"],
  ["browline", "jade"],
  ["browline", "slate"],
  ["square", "ink"],
  ["square", "amber"],
  ["lens", "jade"],
  ["lens", "slate"],
];

for (const [shape, tone] of combos) {
  const name = `${shape}-${tone}.svg`;
  writeFileSync(join(OUT, name), svg(shape, tone), "utf8");
  console.log("wrote", name);
}

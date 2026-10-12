const sharp = require("sharp");

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#0f172a"/>
  <rect x="116" y="90" width="280" height="320" rx="32" fill="#ffffff"/>
  <rect x="145" y="125" width="222" height="105" rx="12" fill="#0f172a"/>
  <circle cx="175" cy="380" r="30" fill="#0f172a"/>
  <circle cx="337" cy="380" r="30" fill="#0f172a"/>
  <path d="M195 175h65m-32-32v64" stroke="#38bdf8" stroke-width="16" stroke-linecap="round"/>
</svg>
`);

Promise.all([
  sharp(svg).resize(192, 192).png().toFile("public/pwa-192x192.png"),
  sharp(svg).resize(512, 512).png().toFile("public/pwa-512x512.png")
])
.then(() => console.log("PWA icons created successfully!"))
.catch(console.error);

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cyberpoint — Cybersecurity",
    short_name: "Cyberpoint",
    description: "24/7 SOC, penetration testing, digital forensics, audit and cybersecurity products in Azerbaijan.",
    start_url: "/az",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0d1550",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

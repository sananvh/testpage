import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cyberpoint · Admin", robots: { index: false, follow: false } };

const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["400", "500", "600", "700"], variable: "--font-manrope" });

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";
import SiteHeader from "@/components/layout/SiteHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const noto = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "Katana Forge",
  description: "Atelier de configuration 3D pour katanas sur-mesure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="bg-oniBlack">
      <body className={`${inter.variable} ${noto.variable} bg-oniBlack text-white`}>
        <AppProviders>
          <div className="relative min-h-screen overflow-hidden bg-oniBlack text-white">
            <div className="pointer-events-none absolute inset-0 bg-sunburst opacity-80" aria-hidden />
            <div className="relative z-10 flex min-h-screen flex-col bg-gradient-to-br from-black/70 via-oniBlack to-black/90">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-white/10 bg-black/40 px-6 py-4 text-center text-xs uppercase tracking-[0.4em] text-white/50 backdrop-blur">
                Forge avec passion - Katana Forge (c) {new Date().getFullYear()}
              </footer>
            </div>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

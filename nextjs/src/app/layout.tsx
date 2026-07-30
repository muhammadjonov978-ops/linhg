import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppLayout from "./app-layout";

export const metadata: Metadata = {
  title: "PolyglotPro - 7 Tilda Til O'rganing",
  description: "PolyglotPro - Interaktiv 7 tilda til o'rganish platformasi. Reading, Listening, Writing, Speaking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-200">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}

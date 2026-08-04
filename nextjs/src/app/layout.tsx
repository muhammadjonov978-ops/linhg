import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import AppLayout from "./app-layout";

export const metadata: Metadata = {
  title: "Lingohub - 27 Tilda Til O'rganing",
  description: "Lingohub - Interaktiv 27 tilda til o'rganish platformasi. Reading, Listening, Writing, Speaking.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "1024x1024" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "google-site-verification": "YrvejNQQbEew1xV-Y1gTh-UZyLOcrYWQDPvVYgJiCww",
  },
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

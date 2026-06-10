import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LTIContextProvider } from "@/contexts/LTIContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echo",
  description: "AI Audio Generation for Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <LTIContextProvider>{children}</LTIContextProvider>
      </body>
    </html>
  );
}

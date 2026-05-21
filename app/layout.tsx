import type { Metadata } from "next";
import { Nunito, Lora, Dancing_Script } from "next/font/google";
import "./globals.css";
import { AdminToolbar } from "@/components/ui/AdminToolbar";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "thankyoucards.au",
  description: "Beautiful, personalised thank you cards sent instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${lora.variable} ${dancing.variable}`}>
      <head>
        <link rel="icon" href="/TYC.png" />
        <link rel="apple-touch-icon" href="/TYC.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="TYCards" />
        <meta name="theme-color" content="#3A8FA0" />
      </head>
      <body>
        <AdminToolbar />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Nunito, Lora, Dancing_Script, Gelasio, Anton, Permanent_Marker, Bangers, Playfair_Display, Caprasimo, Pacifico } from "next/font/google";
import "./globals.css";
import { AdminToolbar } from "@/components/ui/AdminToolbar";
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800", "900"],
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

// Drawn to match Georgia's shapes and spacing: used wherever Georgia is missing (Android phones,
// the server's Chrome that makes print files and Save to Photos images). Not preloaded, so
// devices that have Georgia never download it.
const gelasio = Gelasio({
  subsets: ["latin"],
  variable: "--font-gelasio",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

// The cover text fonts people can pick with "Aa" (lib/coverText.ts). Not preloaded: only a card
// that uses one downloads it.
const anton = Anton({ subsets: ["latin"], variable: "--font-anton", weight: "400", display: "swap", preload: false });
const marker = Permanent_Marker({ subsets: ["latin"], variable: "--font-marker", weight: "400", display: "swap", preload: false });
const bangers = Bangers({ subsets: ["latin"], variable: "--font-bangers", weight: "400", display: "swap", preload: false });
const pacifico = Pacifico({ subsets: ["latin"], variable: "--font-pacifico", weight: "400", display: "swap", preload: false });
const caprasimo = Caprasimo({ subsets: ["latin"], variable: "--font-caprasimo", weight: "400", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["700"], display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://thankyoucards.au"),
  title: "thankyoucards.au",
  description: "Beautiful, personalised thank you cards sent instantly",
  openGraph: {
    title: "thankyoucards.au",
    description: "Beautiful, personalised thank you cards sent instantly",
    siteName: "thankyoucards.au",
    images: [{ url: "/og-image.png", width: 630, height: 630, alt: "thankyoucards.au" }],
  },
  twitter: {
    card: "summary",
    title: "thankyoucards.au",
    description: "Beautiful, personalised thank you cards sent instantly",
    images: ["/og-image.png"],
  },
};

// maximumScale 1 stops iPhone Safari auto-zooming whenever a text field with a
// small font is tapped (and zooming back out after). iOS still lets people pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${lora.variable} ${dancing.variable} ${gelasio.variable} ${anton.variable} ${marker.variable} ${bangers.variable} ${playfair.variable} ${caprasimo.variable} ${pacifico.variable}`}>
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
        <Analytics />
        {children}
      </body>
    </html>
  );
}

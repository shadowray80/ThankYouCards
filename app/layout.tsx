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
      <body>
        <AdminToolbar />
        {children}
      </body>
    </html>
  );
}

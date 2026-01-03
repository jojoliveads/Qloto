import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";

import "daterangepicker/daterangepicker.css";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

/* ✅ metadata (NO viewport here) */
export const metadata: Metadata = {
  title: "HomeService Pro - Reliable Home Services at Your Doorstep",
  description:
    "Find trusted professionals for all your home service needs. From cleaning to repairs, HomeService Pro connects you with top-rated local experts.",
  keywords:
    "home services, cleaning, repairs, maintenance, plumbing, electrical, handyman, local experts",
};

/* ✅ viewport MUST be exported separately in App Router */
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>


        {children}
      </body>
    </html>
  );
}
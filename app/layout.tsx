import type { Metadata } from "next";
import { Karla, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const regularFont = Karla({
  variable: "--font-sans",
  subsets: ["latin"],
});

const monoFont = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Map of Colony Craft",
  description:
    "Web-based map viewer for the Colony Craft minecraft server. It allows players to view and interact with the world in a web browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${regularFont.variable} ${monoFont.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-center"
          theme="dark"
          richColors
        />
      </body>
    </html>
  );
}

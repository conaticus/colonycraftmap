import type { Metadata } from "next";
import { Karla } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";

const regularFont = Karla({
  variable: "--font-sans",
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
      <body className={`${regularFont.variable} antialiased`}>
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

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeGuard V2",
  description: "Professional trading risk management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

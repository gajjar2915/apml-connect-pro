import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "APML Connect Pro - SaaS Healthcare Platform",
  description: "Enterprise multi-tenant hospital management, telemedicine, EMR/EHR, and AI consult co-pilot.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

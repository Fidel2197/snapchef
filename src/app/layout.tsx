import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SnapChef",
  description: "Analyze a food photo and turn it into ingredients, recipe steps, and cooking video searches.",
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

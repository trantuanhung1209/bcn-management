import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Management",
  description: "Web Team Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neu-bg font-sans">
        {children}
      </body>
    </html>
  );
}

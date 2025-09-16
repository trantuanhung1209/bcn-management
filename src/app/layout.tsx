import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamHub - Management System",
  description: "Hệ thống quản lý nhóm hiện đại và hiệu quả",
  icons: {
    icon: [
      {
        url: '/favicon/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/favicon/favicon-96x96.png',
        type: 'image/png',
        sizes: '96x96',
      },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/favicon.svg',
        color: '#5bbad5',
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  themeColor: '#ffffff',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  authors: [{ name: 'TeamHub Development Team' }],
  keywords: ['team management', 'project management', 'collaboration', 'teamhub'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* Additional meta tags for better browser support */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      </head>
      <body className="antialiased bg-neu-bg font-sans">
        {children}
      </body>
    </html>
  );
}

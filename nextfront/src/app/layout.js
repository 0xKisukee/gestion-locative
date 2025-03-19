import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gestion Locative",
  description: "Simplifiez la gestion de vos locations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <Providers>
          <main className="container mx-auto py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Evolving Home — Your Home's Energy Score in 30 Seconds",
  description: "Get your home's energy efficiency score instantly. See how much you could save, what improvements to make, and find local contractors. Free, privacy-first.",
  openGraph: {
    title: "Evolving Home — Your Home's Energy Score in 30 Seconds",
    description: "Get your home's energy efficiency score instantly. See savings, improvements, and local contractors.",
    url: "https://evolvinghome.ai",
    siteName: "Evolving Home",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

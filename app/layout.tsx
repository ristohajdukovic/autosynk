import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { getCachedSession } from "@/lib/supabase/session";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/layout/app-header";

const inter = Inter({ subsets: ["latin"] });

const siteTitle = "AutoSync | Smarter Vehicle Maintenance";
const siteDescription =
  "Track mileage, manage maintenance, and keep a digital logbook for every vehicle with AutoSync.";
const siteUrl = "https://autosync.app";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  applicationName: "AutoSync",
  manifest: "/manifest.json",
  authors: [{ name: "AutoSync" }],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "AutoSync",
    locale: "en_US",
    type: "website"
    // images: [
    //   {
    //     url: `${siteUrl}/og-image.png`,
    //     width: 1200,
    //     height: 630
    //   }
    // ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription
    // images: [`${siteUrl}/og-image.png`]
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950`}>
        <SupabaseProvider session={session}>
          <div className="flex min-h-screen flex-col">
            <AppHeader session={session} />
            <main className="flex-1 px-4 pb-16 pt-8 sm:px-8">{children}</main>
          </div>
        </SupabaseProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

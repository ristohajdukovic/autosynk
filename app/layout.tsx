import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { createServerClient } from "@/lib/supabase/server";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { Toaster } from "sonner";
import { AppHeader } from "@/components/layout/app-header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoSync | Smarter Vehicle Maintenance",
  description:
    "Track mileage, manage maintenance, and keep a digital logbook for every vehicle with AutoSync.",
  applicationName: "AutoSync",
  manifest: "/manifest.json",
  authors: [{ name: "AutoSync" }]
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

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

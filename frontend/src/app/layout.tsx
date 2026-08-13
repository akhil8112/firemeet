import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "FireMeet",
  description: "Meeting productivity application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-900 transition-colors`}>
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-y-auto p-8 text-slate-900 dark:text-slate-100">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

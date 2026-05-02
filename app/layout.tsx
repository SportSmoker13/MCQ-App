import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MCQ Manager — AI-Powered Exam Prep",
  description: "Upload exam images and let AI extract, answer, and organize your questions for mock tests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-50 min-h-screen antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-slate-900 py-6 text-center text-sm text-slate-500">
              <div className="max-w-7xl mx-auto px-4">
                © {new Date().getFullYear()} MCQ Manager. Powered by Llama 3 & Next.js.
              </div>
            </footer>
          </div>
          
          {/* Global Background Glows */}
          <div className="fixed top-0 left-0 -z-10 h-full w-full pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
          </div>
        </Providers>
      </body>
    </html>
  );
}

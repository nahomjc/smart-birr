import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { IntroGate } from "@/components/intro/intro-gate";
import { RouteProgress } from "@/components/layout/route-progress";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Birr — AI Financial Guide",
  description:
    "AI financial counselor, expense tracker, and budget planner for Ethiopian Birr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <RouteProgress />
        <IntroGate>{children}</IntroGate>
      </body>
    </html>
  );
}

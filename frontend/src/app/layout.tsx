"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileImage, Upload, Activity, Sun, Moon } from "lucide-react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bemorlar", href: "/patients", icon: Users },
  { name: "Tahlillar", href: "/analyses", icon: FileImage },
  { name: "Yuklash", href: "/upload", icon: Upload },
  { name: "Statistika", href: "/statistics", icon: Activity },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl border-r border-cyan-100 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-cyan-100 dark:border-slate-700">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Ko&apos;krak Saratoni
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Aniqlash Tizimi</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 animate-fade-in-left ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 scale-105"
                      : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-slate-700 dark:hover:to-slate-600 hover:text-cyan-600 dark:hover:text-cyan-400 hover:scale-105 hover:shadow-md"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle & Footer */}
          <div className="p-4 border-t border-cyan-100 dark:border-slate-700 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 hover:from-cyan-100 hover:to-blue-100 dark:hover:from-slate-600 dark:hover:to-slate-500 transition-all duration-300 text-cyan-700 dark:text-cyan-300 hover:scale-105 hover:shadow-lg group"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Qorong'i rejim</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span className="font-medium">Yorug' rejim</span>
                </>
              )}
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
              Version 1.0.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LayoutContent>{children}</LayoutContent>
        </ThemeProvider>
      </body>
    </html>
  );
}

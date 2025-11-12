"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  FileImage,
  LayoutDashboard,
  Monitor,
  Moon,
  Sun,
  Upload,
  Users,
} from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Bemorlar", href: "/patients", icon: Users },
  { name: "Tahlillar", href: "/analyses", icon: FileImage },
  { name: "Yuklash", href: "/upload", icon: Upload },
  { name: "Multi-view", href: "/upload-multi", icon: Upload },
  { name: "Statistika", href: "/statistics", icon: Activity },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, themeSource, toggleTheme, useSystemTheme } = useTheme();

  return (
    <div className="flex h-screen bg-slate-100/60 dark:bg-slate-950">
      <aside className="w-64 bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/70 dark:border-slate-800 shadow-xl">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200/70 dark:border-slate-800">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Ko&apos;krak Saratoni
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Aniqlash Tizimi
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item, index) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 animate-fade-in-left ${
                    isActive
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200/70 dark:border-slate-800 space-y-3">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 text-slate-700 dark:text-slate-200 group"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-medium">Qorongʼi rejim</span>
                </>
              ) : (
                <>
                  <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span className="font-medium">Yorugʼ rejim</span>
                </>
              )}
            </button>
            <button
              onClick={useSystemTheme}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                themeSource === "system"
                  ? "border-slate-400 text-slate-600 dark:border-slate-500 dark:text-slate-300"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Tizim andozasi</span>
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
              Rejim: {themeSource === "system" ? "Avtomatik" : "Qoʼlda"}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center">
              Version 1.0.0
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white/90 dark:bg-slate-950">
        {children}
      </main>
    </div>
  );
}

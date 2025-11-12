"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  LayoutDashboard,
  RefreshCw,
  UploadCloud,
  Users,
} from "lucide-react";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { PatientChart } from "@/components/dashboard/PatientChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentAnalyses } from "@/components/dashboard/RecentAnalyses";
import { useTheme } from "@/contexts/ThemeContext";
import { useAnalysesList } from "@/hooks/useAnalyses";
import {
  useStatisticsOverview,
  useStatisticsTrends,
} from "@/hooks/useStatistics";
import type { AnalysisListResponse } from "@/types/analysis";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import type { AnalysisSummary } from "@/types/analysis";

type ServiceStatus = "online" | "offline" | "degraded";

const STATUS_META: Record<
  ServiceStatus,
  { label: string; badge: string; dot: string }
> = {
  online: {
    label: "Faol",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  degraded: {
    label: "Cheklangan",
    badge:
      "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  offline: {
    label: "Uzilgan",
    badge:
      "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

const SERVICE_ITEMS = [
  { id: "api", label: "API Server", description: "FastAPI xizmati" },
  { id: "database", label: "Maʼlumotlar bazasi", description: "PostgreSQL" },
  { id: "model", label: "AI modeli", description: "YOLO inferensi" },
  { id: "storage", label: "Fayl saqlash", description: "Rasm va hisobotlar" },
];

export default function DashboardPage() {
  const { theme } = useTheme();
  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useStatisticsOverview();
  const {
    data: trends,
    isLoading: isTrendLoading,
    refetch: refetchTrends,
  } = useStatisticsTrends(30);
  const {
    data: analyses,
    isLoading: isAnalysesLoading,
    refetch: refetchAnalyses,
  } = useAnalysesList({ limit: 5, skip: 0 }) as {
    data: AnalysisListResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  const systemStatus = useSystemStatus();

  const serviceStatus: ServiceStatus = systemStatus.isError
    ? "offline"
    : systemStatus.data?.health.status === "ok"
      ? "online"
      : "degraded";

  const recentAnalyses: AnalysisSummary[] = analyses?.items ?? [];

  const chartData = useMemo(() => {
    if (!trends?.labels) return [];
    return trends.labels.map((label: string, index: number) => ({
      label,
      analyses: trends.analyses?.[index] ?? 0,
      findings: trends.findings?.[index] ?? 0,
    }));
  }, [trends]);

  const totalAnalyses = stats?.total_analyses ?? 0;
  const completionRate = totalAnalyses
    ? Math.round(((stats?.completed_analyses ?? 0) / totalAnalyses) * 100)
    : 0;
  const failureRate = totalAnalyses
    ? Math.round(((stats?.failed_analyses ?? 0) / totalAnalyses) * 100)
    : 0;

  const quickActions = [
    {
      href: "/analyses/new",
      label: "Yangi tahlil",
      description: "Diagnostika uchun surat yuklash",
      icon: UploadCloud,
      accent: "from-indigo-500 to-sky-500",
    },
    {
      href: "/patients/new",
      label: "Bemor qoʼshish",
      description: "Yangi bemor profilini yarating",
      icon: Users,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      href: "/statistics",
      label: "Statistika",
      description: "Trendlarni chuqur koʼrib chiqing",
      icon: BarChart3,
      accent: "from-cyan-500 to-blue-500",
    },
    {
      href: "/analyses",
      label: "Tahlillar roʼyxati",
      description: "Barcha natijalarni boshqaring",
      icon: Activity,
      accent: "from-purple-500 to-pink-500",
    },
  ];

  const statCards = [
    {
      label: "Jami bemorlar",
      value: stats?.total_patients ?? 0,
      changeLabel: "Aktiv bemorlar monitoringda",
      trend: "up" as const,
      icon: Users,
      accent: "from-cyan-500 to-blue-500",
    },
    {
      label: "Jami tahlillar",
      value: totalAnalyses,
      changeLabel: "Soʼnggi 30 kunda oʼsish",
      trend: "up" as const,
      icon: Activity,
      accent: "from-indigo-500 to-sky-500",
    },
    {
      label: "Muvaffaqiyat darajasi",
      value: completionRate,
      changeLabel: `${completionRate}% yakunlandi`,
      trend: completionRate >= 50 ? ("up" as const) : ("down" as const),
      icon: CheckCircle2,
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Xatoliklar",
      value: stats?.failed_analyses ?? 0,
      changeLabel: `${failureRate}% nazorat talab etadi`,
      trend: failureRate > 5 ? ("up" as const) : ("down" as const),
      icon: AlertCircle,
      accent: "from-rose-500 to-pink-500",
    },
  ];

  const isLoading = isStatsLoading && !stats;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-10">
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="h-12 w-1/3 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-3xl border border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/60"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const lastChecked = systemStatus.data?.checkedAt
    ? new Date(systemStatus.data.checkedAt)
    : systemStatus.dataUpdatedAt
      ? new Date(systemStatus.dataUpdatedAt)
      : null;

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-4 pb-8"
        >
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <LayoutDashboard className="h-4 w-4" />
            Klinik operatsiyalar paneli
          </span>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">
            Diagnostika natijalarini real vaqtda kuzatib boring
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            AI modeli, bemorlar oqimi va klinik qarorlarni boshqarish uchun
            markaziy boshqaruv paneli. Quyidagi statistikalar tizim sogʼligʼi
            va tahlillar koʼrsatkichlarini aks ettiradi.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-medium ${STATUS_META[serviceStatus].badge
                }`}
            >
              <span
                className={`inline-flex h-2 w-2 rounded-full ${STATUS_META[serviceStatus].dot
                  }`}
              />
              {STATUS_META[serviceStatus].label}
            </span>
            {lastChecked && (
              <span className="rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/60">
                Oxirgi tekshiruv:{" "}
                {lastChecked.toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button
              onClick={() => {
                refetchStats();
                refetchTrends();
                refetchAnalyses();
                void systemStatus.refetch();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-medium text-indigo-600 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${systemStatus.isFetching ? "animate-spin" : ""
                  }`}
              />
              Yangilash
            </button>
          </div>
          {statsError && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="h-4 w-4" />
              Statistika maʼlumotlari yuklanmadi.
            </div>
          )}
        </motion.header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatsCard key={card.label} {...card} />
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Trendlar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Oxirgi 30 kun boʼyicha tahlillar va topilmalar
                </p>
              </div>
              {isTrendLoading && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Yuklanmoqda...
                </span>
              )}
            </header>
            <PatientChart data={chartData} isDark={theme === "dark"} />
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tezkor harakatlar
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Koʼp ishlatiladigan klinik oqimlarga oʼtish
            </p>
            <div className="mt-5">
              <QuickActions actions={quickActions} />
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Soʼnggi tahlillar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yakunlangan va jarayondagi ishlar
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {recentAnalyses.length} ta yozuv
              </span>
            </header>
            <RecentAnalyses
              analyses={recentAnalyses}
              isLoading={isAnalysesLoading}
            />
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Xizmatlar holati
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Backend infratuzilma monitoringi
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {SERVICE_ITEMS.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_META[serviceStatus].badge}`}>
                    {STATUS_META[serviceStatus].label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

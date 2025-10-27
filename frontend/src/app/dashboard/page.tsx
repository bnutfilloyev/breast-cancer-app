"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Activity,
  Clock,
  AlertCircle,
  TrendingUp,
  Brain,
  Zap,
  Star,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { statisticsAPI, systemAPI } from "@/lib/api";

type ServiceStatus = "online" | "offline" | "degraded";

type ServiceState = {
  id: string;
  label: string;
  description: string;
  status: ServiceStatus;
};

const SERVICE_ITEMS: Array<Omit<ServiceState, "status">> = [
  { id: "api", label: "API server", description: "FastAPI asosiy xizmat" },
  { id: "database", label: "Maʼlumotlar bazasi", description: "PostgreSQL maʼlumotlar ombori" },
  { id: "model", label: "AI modeli", description: "YOLO asosidagi tahlil xizmati" },
  { id: "storage", label: "Fayl saqlash", description: "Rasm va hisobot fayllari" },
];

const STATUS_STYLES: Record<ServiceStatus, { badge: string; dot: string; label: string }> = {
  online: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500",
    label: "Faol",
  },
  degraded: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
    dot: "bg-amber-500",
    label: "Cheklangan",
  },
  offline: {
    badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300",
    dot: "bg-rose-500",
    label: "Uzilgan",
  },
};

type Statistics = {
  total_patients: number;
  total_analyses: number;
  completed_analyses: number;
  pending_analyses: number;
  processing_analyses: number;
  failed_analyses: number;
  total_findings: number;
  total_images: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [serviceStates, setServiceStates] = useState<ServiceState[]>(() =>
    SERVICE_ITEMS.map((item) => ({ ...item, status: "online" }))
  );
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
    void checkSystemStatus();
    const interval = setInterval(() => {
      void checkSystemStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatistics = async () => {
    try {
      const data = await statisticsAPI.get();
      setStats(data);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  async function checkSystemStatus() {
    try {
      setCheckingStatus(true);
      await systemAPI.health();
      setServiceStates(SERVICE_ITEMS.map((item) => ({ ...item, status: "online" })));
      setStatusError(null);
    } catch (error) {
      console.error("Failed to check system status:", error);
      setServiceStates(SERVICE_ITEMS.map((item) => ({ ...item, status: "offline" })));
      setStatusError("Backend bilan aloqa mavjud emas.");
    } finally {
      setLastChecked(new Date());
      setCheckingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/70 dark:bg-slate-900"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAnalyses = stats?.total_analyses ?? 0;
  const completionRate = totalAnalyses ? Math.round(((stats?.completed_analyses ?? 0) / totalAnalyses) * 100) : 0;
  const failureRate = totalAnalyses ? Math.round(((stats?.failed_analyses ?? 0) / totalAnalyses) * 100) : 0;
  const averageFindings = totalAnalyses ? (stats?.total_findings ?? 0) / totalAnalyses : 0;
  const analysesPerPatient = stats?.total_patients ? stats.total_analyses / Math.max(stats.total_patients, 1) : 0;
  const queueCount = Math.max(
    totalAnalyses - ((stats?.completed_analyses ?? 0) + (stats?.failed_analyses ?? 0)),
    0
  );
  const queueRate = totalAnalyses ? Math.round((queueCount / totalAnalyses) * 100) : 0;

  const statCards = [
    {
      label: "Jami Bemorlar",
      value: stats?.total_patients || 0,
      icon: Users,
      color: "from-cyan-500 to-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Jami Tahlillar",
      value: stats?.total_analyses || 0,
      icon: Activity,
      color: "from-emerald-500 to-teal-500",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Bajarilgan tahlillar",
      value: stats?.completed_analyses || 0,
      icon: CheckCircle2,
      color: "from-indigo-500 to-sky-500",
      change: `${completionRate}% muvaffaqiyat`,
      trend: "up",
    },
    {
      label: "Muammoli tahlillar",
      value: stats?.failed_analyses || 0,
      icon: AlertCircle,
      color: "from-rose-500 to-pink-500",
      change: `${failureRate}% nazoratda`,
      trend: failureRate > 5 ? "up" : "down",
    },
  ];

  const workloadDistribution = [
    {
      label: "Bajarilgan",
      count: stats?.completed_analyses ?? 0,
      percent: completionRate,
      color: "from-emerald-500 to-teal-500",
    },
    {
      label: "Monitoring navbati",
      count: queueCount,
      percent: queueRate,
      color: "from-indigo-500 to-blue-500",
    },
    {
      label: "Xatoliklar",
      count: stats?.failed_analyses ?? 0,
      percent: failureRate,
      color: "from-rose-500 to-pink-500",
    },
  ];

  const insightBadges = [
    {
      label: "Muvaffaqiyat darajasi",
      value: `${completionRate}%`,
      description: "Tahlillar muvaffaqiyatli yakunlandi",
      accent: "from-emerald-500 to-teal-500",
    },
    {
      label: "Oʼrtacha topilmalar",
      value: `${averageFindings.toFixed(1)}`,
      description: "Har bir tahlil boʼyicha",
      accent: "from-indigo-500 to-purple-500",
    },
    {
      label: "Tahlillar/Bemor",
      value: `${analysesPerPatient.toFixed(1)}`,
      description: "Ish yuklamasi koʼrsatkichi",
      accent: "from-cyan-500 to-blue-500",
    },
  ];

  const focusAreas = [
    {
      title: "Muvaffaqiyat barqarorligi",
      value: `${completionRate}% yakunlangan`,
      description: "AI pipeline real vaqt rejimida ishlamoqda",
      icon: CheckCircle2,
      container: "border-emerald-200/70 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10",
      iconColor: "text-emerald-500 dark:text-emerald-300",
    },
    {
      title: "Monitoring navbati",
      value: `${queueCount.toLocaleString()} ta tahlil`,
      description: "Yangi natijalar avtomatik monitoringda",
      icon: RefreshCw,
      container: "border-indigo-200/70 dark:border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-500/10",
      iconColor: "text-indigo-500 dark:text-indigo-300",
    },
    {
      title: "Xavfli natijalar",
      value: `${stats?.failed_analyses ?? 0} ta`,
      description: "Qoʼshimcha tekshiruv talab qilinadi",
      icon: AlertCircle,
      container: "border-rose-200/70 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-500/10",
      iconColor: "text-rose-500 dark:text-rose-300",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-1/2 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute bottom-0 right-10 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl dark:bg-purple-500/10" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-8 lg:grid-cols-[2fr,1fr] lg:items-start"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
              <Brain className="h-3.5 w-3.5" />
              AI diagnostika boshqaruv paneli
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Klinik operatsiyalarni real vaqtda kuzatib boring
              </h1>
              <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400">
                Dashboard tahlillar hajmi, muhim koʼrsatkichlar va xizmatlar holatini bir joyda jamlaydi. AI modeli va klinik jamoa oʼrtasidagi hamkorlikni samarali boshqarish uchun moʼljallangan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                {statusError ? "Cheklangan holat" : "Tizim faol"}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
                <Zap className="h-4 w-4" />
                Real-time monitoring yoqilgan
              </div>
              {lastChecked && (
                <div className="rounded-full border border-slate-200/70 bg-white px-4 py-2 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                  Oxirgi tekshiruv: {lastChecked.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
            {statusError && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4 text-sm text-rose-600 shadow-sm dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                <AlertCircle className="h-5 w-5" />
                {statusError}
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Bugungi natija</h2>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Bajarilgan tahlillar</p>
                  <p className="text-3xl font-semibold text-slate-900 dark:text-white">{(stats?.completed_analyses || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-slate-100/80 p-4 text-sm text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                  Muvaffaqiyat darajasi <span className="font-semibold text-slate-900 dark:text-white">{completionRate}%</span>
                  <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => checkSystemStatus()}
              disabled={checkingStatus}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-80 dark:border-slate-700"
            >
              {checkingStatus ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Tekshirilmoqda
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Xizmatlarni tekshirish
                </>
              )}
            </motion.button>
          </div>
        </motion.header>

        <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, type: "spring", stiffness: 180 }}
              whileHover={{ y: -6 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">{(stat.value || 0).toLocaleString()}</p>
                </div>
                <div className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 text-white shadow-md`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <ArrowUpRight className={`h-3 w-3 ${stat.trend === "down" ? "rotate-90" : ""}`} />
                {stat.change}
              </div>
            </motion.div>
          ))}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ish yuklamasi</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">AI pipeline boʼyicha status taqsimoti</p>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {workloadDistribution.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>{item.label}</span>
                    <span>{item.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.count.toLocaleString()} ta tahlil</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Xizmatlar holati</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Backend infratuzilma monitoringi</p>
              </div>
              <Activity className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-6 space-y-3">
              {serviceStates.map((service) => {
                const styles = STATUS_STYLES[service.status];
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                        {service.label}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{service.description}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                      {styles.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-2.5 text-white shadow-md">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Strategik koʼrsatkichlar</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Klinik samaradorlik uchun kuzatuv</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {insightBadges.map((insight) => (
                <div
                  key={insight.label}
                  className="rounded-2xl border border-slate-200/60 bg-slate-100/80 p-4 text-sm shadow-sm dark:border-slate-800/60 dark:bg-slate-800/70"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{insight.label}</p>
                  <p className={`mt-2 text-3xl font-semibold bg-gradient-to-r ${insight.accent} bg-clip-text text-transparent`}>{insight.value}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{insight.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 text-white shadow-md">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tezkor koʼrsatkichlar</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Joriy faoliyatni umumlashtirish</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              {[
                { label: "Oʼrtacha tahlillar / bemor", value: analysesPerPatient.toFixed(1) },
                { label: "Oʼrtacha topilmalar / tahlil", value: averageFindings.toFixed(1) },
                { label: "Monitoring navbati", value: `${queueRate}%` },
                { label: "Barqarorlik koʼrsatkichi", value: `${(100 - failureRate).toFixed(1)}%` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-md">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Diqqat markazlari</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Operatsion ustuvorliklar</p>
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm">
              {focusAreas.map((area) => (
                <div key={area.title} className={`rounded-2xl border p-4 shadow-sm ${area.container}`}>
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg bg-white/70 p-2 text-sm ${area.iconColor} dark:bg-slate-900/40`}>
                      <area.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{area.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{area.description}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{area.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

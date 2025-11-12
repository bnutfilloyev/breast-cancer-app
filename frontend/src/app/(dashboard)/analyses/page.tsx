"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Loader2, Search, TrendingUp, UploadCloud } from "lucide-react";

import { AnalysisList } from "@/components/analysis/AnalysisList";
import { useAnalysesList, useDeleteAnalysis } from "@/hooks/useAnalyses";
import type { AnalysisListResponse, AnalysisStatus } from "@/types/analysis";

const STATUS_OPTIONS: Array<{ value: AnalysisStatus | "all"; label: string }> = [
  { value: "all", label: "Barcha statuslar" },
  { value: "completed", label: "Bajarilgan" },
  { value: "processing", label: "Jarayonda" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "failed", label: "Muvaffaqiyatsiz" },
];

export default function AnalysesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AnalysisStatus | "all">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { data, isLoading, isFetching } = useAnalysesList({
    status: status === "all" ? undefined : status,
    limit: 100,
  }) as { data: AnalysisListResponse | undefined; isLoading: boolean; isFetching: boolean };
  const deleteAnalysis = useDeleteAnalysis();

  const analyses = useMemo(
    () =>
      (data?.items ?? []).filter((analysis) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
          analysis.id.toString().includes(term) ||
          analysis.dominant_label?.toLowerCase().includes(term) ||
          analysis.dominant_category?.toLowerCase().includes(term ?? "")
        );
      }),
    [data?.items, search]
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute top-1/2 -right-16 h-80 w-80 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/10" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-indigo-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:border-indigo-500/30 dark:bg-slate-900/60">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Jami tahlillar: {data?.total ?? 0}
              </span>
              {isFetching && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" aria-hidden />}
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Tahlillar boshqaruvi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI modelining yakunlangan natijalari va pazor aniqlash jarayonlarini boshqaring.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
            >
              <UploadCloud className="h-4 w-4" />
              Yangi tahlil yuklash
            </a>
          </div>
        </header>

        <section className="mt-8 grid gap-4 lg:grid-cols-[2fr,1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ID, label yoki kategoriya boʼyicha qidirish..."
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-12 py-3 text-sm text-slate-700 shadow-sm backdrop-blur focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-indigo-400"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as AnalysisStatus | "all")}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/90 px-12 py-3 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-indigo-400"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
          <AnalysisList
            analyses={analyses}
            isLoading={isLoading}
            deletingId={deletingId}
            onDelete={(id) => {
              if (!confirm("Ushbu tahlilni oʼchirmoqchimisiz?")) return;
              setDeletingId(id);
              deleteAnalysis
                .mutateAsync(id)
                .catch((error) => {
                  console.error("Failed to delete analysis", error);
                })
                .finally(() => setDeletingId(null));
            }}
          />
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileImage,
  Trash2,
} from "lucide-react";

import type { AnalysisSummary, AnalysisStatus } from "@/types/analysis";

type AnalysisListProps = {
  analyses: AnalysisSummary[];
  onDelete?: (analysisId: number) => void;
  deletingId?: number | null;
  isLoading?: boolean;
};

const STATUS_META: Record<
  AnalysisStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    label: "Bajarilgan",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  pending: {
    label: "Kutilmoqda",
    badge:
      "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    icon: Clock,
  },
  processing: {
    label: "Jarayonda",
    badge:
      "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
    icon: Activity,
  },
  failed: {
    label: "Xatolik",
    badge:
      "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    icon: AlertCircle,
  },
};

export function AnalysisList({
  analyses,
  onDelete,
  deletingId,
  isLoading = false,
}: AnalysisListProps) {
  if (isLoading && analyses.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800 dark:bg-slate-900/70"
          />
        ))}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
        <FileImage className="h-10 w-10" />
        Tahlillar mavjud emas.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {analyses.map((analysis) => {
        const meta = STATUS_META[analysis.status];
        const Icon = meta.icon;
        return (
          <li
            key={analysis.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
          >
            <div>
              <Link
                href={`/analyses/${analysis.id}`}
                className="text-sm font-semibold text-slate-900 hover:underline dark:text-slate-100"
              >
                Tahlil #{analysis.id}
              </Link>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {analysis.dominant_label
                  ? `Natija: ${analysis.dominant_label}`
                  : "Natija kutilmoqda"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formatDate(analysis.created_at)} •{" "}
                {analysis.total_findings ?? 0} topilma
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/analyses/${analysis.id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Eye className="h-4 w-4" />
                Koʼrish
              </Link>
              <button
                onClick={() => onDelete?.(analysis.id)}
                disabled={deletingId === analysis.id}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Oʼchirish
              </button>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}
              >
                <Icon className="h-4 w-4" />
                {meta.label}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

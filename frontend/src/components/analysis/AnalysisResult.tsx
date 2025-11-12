import { Activity, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react";

import type { AnalysisDetail, AnalysisSummary } from "@/types/analysis";

type AnalysisResultProps = {
  analysis: AnalysisDetail | AnalysisSummary;
};

const STATUS_TEXT: Record<
  AnalysisSummary["status"],
  { label: string; description: string; icon: typeof CheckCircle2; badge: string }
> = {
  completed: {
    label: "Bajarilgan",
    description: "Natijalar koʼrish uchun tayyor.",
    icon: CheckCircle2,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  pending: {
    label: "Navbatda",
    description: "AI pipeline navbatda ishlov beradi.",
    icon: Clock,
    badge: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  processing: {
    label: "Jarayonda",
    description: "Model hozirda tasvirni tahlil qilmoqda.",
    icon: Activity,
    badge: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  },
  failed: {
    label: "Xatolik",
    description: "Tahlil muvaffaqiyatsiz tugadi, takror urinib koʼring.",
    icon: AlertCircle,
    badge: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  },
};

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const meta = STATUS_TEXT[analysis.status];
  const Icon = meta.icon;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tahlil #{analysis.id}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(analysis.created_at).toLocaleString("uz-UZ")}
          </p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}>
          <Icon className="h-4 w-4" />
          {meta.label}
        </span>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ResultTile label="Topilmalar" value={`${analysis.total_findings ?? 0}`} />
        <ResultTile label="Dominant label" value={analysis.dominant_label ?? "—"} />
        <ResultTile label="Kategoriya" value={analysis.dominant_category ?? "—"} />
      </div>

      {"findings_description" in analysis && analysis.findings_description ? (
        <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <FileText className="h-4 w-4" />
            Batafsil tavsif
          </div>
          <p>{analysis.findings_description}</p>
        </div>
      ) : null}
    </div>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

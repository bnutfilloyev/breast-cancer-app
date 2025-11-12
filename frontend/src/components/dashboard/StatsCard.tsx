import { LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "flat";

type StatsCardProps = {
  label: string;
  value: number;
  changeLabel?: string;
  accent?: string;
  trend?: Trend;
  icon: LucideIcon;
};

export function StatsCard({
  label,
  value,
  changeLabel,
  accent = "from-indigo-500 to-purple-500",
  trend = "flat",
  icon: Icon,
}: StatsCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-4xl font-semibold text-slate-900 dark:text-white">
            {value.toLocaleString("uz-UZ")}
          </p>
        </div>
        <span className={`rounded-xl bg-gradient-to-br ${accent} p-3 text-white shadow-md`}>
          <Icon className="h-5 w-5" />
        </span>
      </header>
      {changeLabel && (
        <footer className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <TrendArrow trend={trend} />
          {changeLabel}
        </footer>
      )}
    </article>
  );
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === "flat") {
    return <span className="inline-block h-2 w-4 rounded bg-slate-400 dark:bg-slate-600" />;
  }

  return (
    <span
      className={`inline-flex h-2.5 w-2.5 rotate-45 ${
        trend === "up" ? "border-l-2 border-t-2 border-emerald-500" : "border-l-2 border-b-2 border-rose-500"
      }`}
      aria-hidden
    />
  );
}

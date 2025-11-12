import Link from "next/link";
import { LucideIcon } from "lucide-react";

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent?: string;
};

type QuickActionsProps = {
  actions: QuickAction[];
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {action.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {action.description}
                </p>
              </div>
              <span
                className={`rounded-xl bg-gradient-to-br ${
                  action.accent ?? "from-indigo-500 to-purple-500"
                } p-3 text-white shadow-md transition group-hover:scale-105`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 transition group-hover:opacity-100 dark:via-white/10" />
          </Link>
        );
      })}
    </div>
  );
}

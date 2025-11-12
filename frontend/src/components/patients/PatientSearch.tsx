import { Search } from "lucide-react";

type PatientSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function PatientSearch({
  value,
  onChange,
  placeholder = "Bemor nomi yoki MRN boʼyicha qidirish...",
}: PatientSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-12 py-3 text-sm text-slate-700 shadow-sm backdrop-blur transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
      />
    </div>
  );
}

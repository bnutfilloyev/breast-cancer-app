import type { ComponentType } from "react";

import Link from "next/link";
import { Calendar, FileText, Mail, MapPin, Phone, User } from "lucide-react";

import { AnalysisHistory } from "@/components/analysis/AnalysisHistory";
import type { AnalysisSummary } from "@/types/analysis";
import type { PatientDetail } from "@/types/patient";

type PatientDetailProps = {
  patient: PatientDetail;
  analyses?: AnalysisSummary[];
  analysesLoading?: boolean;
  onEdit?: () => void;
};

export function PatientDetailCard({
  patient,
  analyses,
  analysesLoading = false,
  onEdit,
}: PatientDetailProps) {
  const age = calculateAge(patient.date_of_birth);
  const historyAnalyses = (analyses ?? patient.analyses ?? []) as AnalysisSummary[];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-500 p-3 text-white shadow-lg">
              <User className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                {patient.full_name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                MRN: {patient.medical_record_number ?? "Belgilanmagan"}
              </p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <p>
              Roʼyxatga olingan sana: {formatDate(patient.created_at)}{" "}
              {patient.updated_at && `(yangilangan ${formatDate(patient.updated_at)})`}
            </p>
            {age && <p>Yoshi: {age}</p>}
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Tafsilotlarni tahrirlash
            </button>
          )}
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patient.date_of_birth && (
            <InfoTile icon={Calendar} label="Tugʼilgan sana" value={formatDate(patient.date_of_birth)} />
          )}
          {patient.phone && <InfoTile icon={Phone} label="Telefon" value={patient.phone} />}
          {patient.email && <InfoTile icon={Mail} label="Email" value={patient.email} />}
          {patient.address && (
            <InfoTile icon={MapPin} label="Manzil" value={patient.address} className="md:col-span-2 lg:col-span-1" />
          )}
          {patient.notes && (
            <InfoTile
              icon={FileText}
              label="Izoh"
              value={patient.notes}
              className="md:col-span-2 lg:col-span-3"
            />
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tahlil tarixi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bemorga tegishli barcha diagnostika natijalari</p>
          </div>
          <Link
            href="/analyses/new"
            className="rounded-xl border border-cyan-200 px-4 py-2 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-50 dark:border-cyan-500/30 dark:text-cyan-300 dark:hover:bg-cyan-500/10"
          >
            Yangi tahlil yaratish
          </Link>
        </header>

        {analysesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-700 dark:bg-slate-900/70"
              />
            ))}
          </div>
        ) : historyAnalyses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            Bu bemor uchun tahlillar mavjud emas.
          </div>
        ) : (
          <AnalysisHistory analyses={historyAnalyses} />
        )}
      </section>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 ${className}`}>
      <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{value}</p>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Mavjud emas";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ");
}

function calculateAge(value: string | null | undefined) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

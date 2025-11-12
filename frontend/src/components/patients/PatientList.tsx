import { motion } from "framer-motion";
import {
  Calendar,
  Edit3,
  Eye,
  Loader2,
  Trash2,
  Users,
} from "lucide-react";

import type { PatientListItem } from "@/types/patient";

type PatientListProps = {
  patients: PatientListItem[];
  onView?: (patientId: number) => void;
  onEdit?: (patientId: number) => void;
  onDelete?: (patientId: number) => void;
  isLoading?: boolean;
  deletingId?: number | null;
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.35, ease: "easeOut" },
  }),
  exit: { opacity: 0, scale: 0.95 },
};

export function PatientList({
  patients,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
  deletingId = null,
}: PatientListProps) {
  if (isLoading && patients.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
          />
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
        <Users className="h-12 w-12 text-slate-400" />
        <div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Bemorlar topilmadi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Qidiruv mezonlarini oʼzgartirib koʼring yoki yangi bemor qoʼshing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {patients.map((patient, index) => (
        <motion.article
          key={patient.id}
          custom={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          whileHover={{ translateY: -6 }}
          className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-md backdrop-blur transition hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/70"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {patient.full_name}
                </h3>
                {patient.medical_record_number && (
                  <p className="text-xs font-medium text-cyan-600 dark:text-cyan-300">
                    MRN: {patient.medical_record_number}
                  </p>
                )}
              </div>
              <div className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-600 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
                {formatDate(patient.created_at)}
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {patient.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{formatDate(patient.date_of_birth)}</span>
                </div>
              )}
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                Holati: {patient.is_active ? "Faol" : "Nofaol"}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => onView?.(patient.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Eye className="h-4 w-4" />
              Koʼrish
            </button>
            <button
              onClick={() => onEdit?.(patient.id)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4" />
              Tahrirlash
            </button>
            <button
              onClick={() => onDelete?.(patient.id)}
              disabled={deletingId === patient.id}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-70 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
            >
              {deletingId === patient.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Oʼchirish
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "Mavjud emas";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ");
}

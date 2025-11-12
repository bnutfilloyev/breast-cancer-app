"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Plus, Users } from "lucide-react";

import { PatientList } from "@/components/patients/PatientList";
import { PatientSearch } from "@/components/patients/PatientSearch";
import { useDeletePatient, usePatientsList } from "@/hooks/usePatients";
import type { PatientListResponse } from "@/types/patient";

const PAGE_SIZE = 20;

export default function PatientsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const queryParams = useMemo(
    () => ({
      skip: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
      search: search ? search.trim() : undefined,
    }),
    [page, search]
  );
  const { data, isLoading, isFetching } = usePatientsList(queryParams) as {
    data: PatientListResponse | undefined;
    isLoading: boolean;
    isFetching: boolean;
  };
  const deletePatient = useDeletePatient();

  const patients = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu bemorni oʼchirmoqchimisiz?")) return;
    try {
      setDeletingId(id);
      await deletePatient.mutateAsync(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <div className="relative z-10 space-y-10 p-6 sm:p-8 lg:p-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:border-cyan-500/30 dark:bg-slate-900/60">
              <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Jami bemorlar: {data?.total ?? 0}
              </span>
              {isFetching && <Loader2 className="h-4 w-4 animate-spin text-cyan-500" aria-hidden />}
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Bemorlar boshqaruvi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bemorlar roʼyxati, kontakt maʼlumotlari va ularning tahlil tarixini kuzatib boring.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/patients/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            Yangi bemor qoʼshish
          </motion.button>
        </header>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <PatientSearch
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </motion.div>

        <PatientList
          patients={patients}
          isLoading={isLoading}
          deletingId={deletingId}
          onView={(id) => router.push(`/patients/${id}`)}
          onEdit={(id) => router.push(`/patients/${id}/edit`)}
          onDelete={handleDelete}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-3xl border border-slate-200/80 bg-white/90 p-4 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-900/70">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              Oldingi
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
            >
              Keyingi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

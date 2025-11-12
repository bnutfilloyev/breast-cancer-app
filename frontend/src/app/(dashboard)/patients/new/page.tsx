"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PatientForm } from "@/components/patients/PatientForm";
import { useCreatePatient } from "@/hooks/usePatients";
import type { PatientCreateInput } from "@/types/patient";

export default function NewPatientPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const createPatient = useCreatePatient();

  const handleSubmit = async (values: PatientCreateInput) => {
    try {
      setError(null);
      await createPatient.mutateAsync(values);
      router.push("/patients");
    } catch (err) {
      console.error(err);
      setError("Bemorni yaratib boʼlmadi, qayta urinib koʼring.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Yangi bemor qoʼshish</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ilovadagi AI pipeline bilan sinxronlash uchun bemor maʼlumotlarini kiriting.
          </p>
        </div>
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}
        <PatientForm
          onSubmit={handleSubmit}
          isSubmitting={createPatient.isPending}
          submitLabel="Bemorni yaratish"
          cancelLabel="Ortga"
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

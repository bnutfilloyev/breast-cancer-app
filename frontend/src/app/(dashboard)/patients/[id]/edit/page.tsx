"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { PatientForm } from "@/components/patients/PatientForm";
import { usePatientDetail, useUpdatePatient } from "@/hooks/usePatients";
import type { PatientCreateInput, PatientUpdateInput } from "@/types/patient";

export default function EditPatientPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const patientId = useMemo(() => Number(params?.id), [params?.id]);
  const {
    data: patient,
    isLoading,
    isError,
    error,
  } = usePatientDetail(Number.isFinite(patientId) ? patientId : undefined);
  const updatePatient = useUpdatePatient(patientId);
  const [formError, setFormError] = useState<string | null>(null);

  if (!patientId || Number.isNaN(patientId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Notoʼgʼri bemor identifikatori.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-center dark:bg-slate-950">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          Bemor maʼlumotlari yuklanmadi: {error instanceof Error ? error.message : "nomaʼlum xatolik"}.
        </div>
        <button
          onClick={() => router.push("/patients")}
          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Roʼyxatga qaytish
        </button>
      </div>
    );
  }

  const handleSubmit = async (values: PatientCreateInput) => {
    try {
      setFormError(null);
      const payload: PatientUpdateInput = { ...values };
      await updatePatient.mutateAsync(payload);
      router.push(`/patients/${patientId}`);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Maʼlumotlarni yangilashda xatolik yuz berdi",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-6 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 lg:px-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Bemor tafsilotlari
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {patient.full_name} maʼlumotlarini tahrirlash
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aloqa maʼlumotlari, klinik eslatmalar va boshqa tafsilotlarni yangilang.
          </p>
        </header>

        {formError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {formError}
          </div>
        )}

        <PatientForm
          defaultValues={patient}
          isSubmitting={updatePatient.isPending}
          submitLabel="Saqlash"
          cancelLabel="Bekor qilish"
          onCancel={() => router.push(`/patients/${patientId}`)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

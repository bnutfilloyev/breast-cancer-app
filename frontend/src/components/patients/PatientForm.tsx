import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type {
  Gender,
  PatientCreateInput,
  PatientDetail,
} from "@/types/patient";

const schema = z.object({
  full_name: z
    .string({ required_error: "Ism familiya majburiy" })
    .min(3, "Kamida 3 ta belgi boʼlishi kerak"),
  medical_record_number: z
    .string()
    .max(50, "MRN 50 ta belgidan oshmasligi kerak")
    .optional()
    .or(z.literal("")),
  date_of_birth: z
    .string()
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other"], {
      errorMap: () => ({ message: "Jins toʼgʼri tanlang" }),
    })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(30, "Telefon raqam juda uzun")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("Yaroqsiz email")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

type PatientFormProps = {
  defaultValues?: Partial<PatientDetail>;
  isSubmitting?: boolean;
  onSubmit: (data: PatientCreateInput) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
};

const GENDER_OPTIONS: Array<{ label: string; value: Gender }> = [
  { label: "Ayol", value: "female" },
  { label: "Erkak", value: "male" },
  { label: "Boshqa", value: "other" },
];

export function PatientForm({
  defaultValues,
  isSubmitting = false,
  onSubmit,
  submitLabel = "Saqlash",
  cancelLabel = "Bekor qilish",
  onCancel,
}: PatientFormProps) {
  const initialValues: FormValues = useMemo(
    () => ({
      full_name: defaultValues?.full_name ?? "",
      medical_record_number: defaultValues?.medical_record_number ?? "",
      date_of_birth: (defaultValues?.date_of_birth ?? "") || "",
      gender: (defaultValues?.gender ?? "") as FormValues["gender"],
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      address: defaultValues?.address ?? "",
      notes: defaultValues?.notes ?? "",
    }),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const submitHandler = handleSubmit(async (values) => {
    const payload: PatientCreateInput = {
      full_name: values.full_name.trim(),
      medical_record_number: normalise(values.medical_record_number),
      date_of_birth: normalise(values.date_of_birth),
      gender: normalise(values.gender) as Gender | undefined,
      phone: normalise(values.phone),
      email: normalise(values.email),
      address: normalise(values.address),
      notes: normalise(values.notes),
    };

    await onSubmit(payload);
  });

  return (
    <form
      onSubmit={submitHandler}
      className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Toʼliq ism" error={errors.full_name?.message} required>
          <input
            {...register("full_name")}
            type="text"
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
            placeholder="Bemor F.I.Sh"
          />
        </Field>
        <Field label="Tibbiy karta (MRN)" error={errors.medical_record_number?.message}>
          <input
            {...register("medical_record_number")}
            type="text"
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
            placeholder="MRN kiriting"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Tugʼilgan sana" error={errors.date_of_birth?.message}>
          <input
            {...register("date_of_birth")}
            type="date"
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
          />
        </Field>
        <Field label="Jins" error={errors.gender?.message}>
          <select
            {...register("gender")}
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
          >
            <option value="">Tanlash...</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Telefon" error={errors.phone?.message}>
          <input
            {...register("phone")}
            type="tel"
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
            placeholder="+998..."
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Elektron pochta" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
            placeholder="example@hospital.uz"
          />
        </Field>
        <Field label="Manzil" error={errors.address?.message}>
          <input
            {...register("address")}
            type="text"
            className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
            placeholder="Hudud, shahar"
          />
        </Field>
      </div>

      <Field label="Izoh" error={errors.notes?.message}>
        <textarea
          {...register("notes")}
          rows={3}
          className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
          placeholder="Qoʼshimcha tibbiy eslatmalar"
        />
      </Field>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
        >
          {isSubmitting ? "Saqlanmoqda..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  error,
  required = false,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
      <span>
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </label>
  );
}

function normalise<T extends string | undefined | null>(value: T) {
  if (typeof value !== "string") return value ?? undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

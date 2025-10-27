"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import { analysisAPI, patientAPI } from "@/lib/api";

type Patient = {
  id: number;
  full_name: string;
  medical_record_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  analyses?: Analysis[];
};

type Analysis = {
  id: number;
  patient_id: number | null;
  mode: string;
  status: string;
  total_findings: number;
  dominant_label: string | null;
  dominant_category: string | null;
  created_at: string;
  completed_at: string | null;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const statusMeta = (status: string) => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "COMPLETED":
      return {
        label: "Bajarilgan",
        badge: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    case "PROCESSING":
      return {
        label: "Jarayonda",
        badge: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
        icon: <Activity className="w-4 h-4" />,
      };
    case "PENDING":
      return {
        label: "Kutilmoqda",
        badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
        icon: <Clock className="w-4 h-4" />,
      };
    case "FAILED":
      return {
        label: "Xatolik",
        badge: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    default:
      return {
        label: normalized,
        badge: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-600/20 dark:text-slate-300 dark:border-slate-500/30",
        icon: <FileText className="w-4 h-4" />,
      };
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "Mavjud emas";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("uz-UZ");
};

const calculateAge = (value?: string | null) => {
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
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = Number(params?.id);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    date_of_birth: "",
    medical_record_number: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (!Number.isFinite(patientId)) {
      setError("Bemor identifikatori noto’g’ri");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [patientData, analysesData] = await Promise.all([
          patientAPI.get(patientId),
          analysisAPI.list({ patient_id: patientId, limit: 100 }),
        ]);

        setPatient(patientData);
        setAnalyses(analysesData.items || patientData.analyses || []);
        setEditForm({
          full_name: patientData.full_name ?? "",
          date_of_birth: patientData.date_of_birth ? patientData.date_of_birth.slice(0, 10) : "",
          medical_record_number: patientData.medical_record_number ?? "",
          phone: patientData.phone ?? "",
          email: patientData.email ?? "",
          address: patientData.address ?? "",
          notes: patientData.notes ?? "",
        });
      } catch (err: any) {
        console.error("Failed to load patient", err);
        setError(err?.message || "Ma’lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    void load();

    return undefined;
  }, [patientId]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const stats = useMemo(() => {
    const totalAnalyses = analyses.length;
    const completed = analyses.filter((item) => item.status === "COMPLETED").length;
    const pending = analyses.filter((item) => item.status === "PENDING" || item.status === "PROCESSING").length;
    const totalFindings = analyses.reduce((sum, item) => sum + (item.total_findings || 0), 0);

    return {
      totalAnalyses,
      completed,
      pending,
      totalFindings,
    };
  }, [analyses]);

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patient) return;

    try {
      setSaving(true);
      const payload = {
        full_name: editForm.full_name.trim(),
        date_of_birth: editForm.date_of_birth ? new Date(editForm.date_of_birth).toISOString() : null,
        medical_record_number: editForm.medical_record_number.trim() || null,
        phone: editForm.phone.trim() || null,
        email: editForm.email.trim() || null,
        address: editForm.address.trim() || null,
        notes: editForm.notes.trim() || null,
      };

      const updated = await patientAPI.update(patient.id, payload);
      setPatient(updated);
      setFeedback({ type: "success", message: "Bemor ma’lumotlari muvaffaqiyatli yangilandi." });
      setShowEditModal(false);
    } catch (err: any) {
      console.error("Failed to update patient", err);
      setFeedback({ type: "error", message: err?.message || "Ma’lumotlarni yangilashda xatolik" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!patient) return;

    try {
      setDeleting(true);
      await patientAPI.delete(patient.id);
      router.push("/patients");
    } catch (err: any) {
      console.error("Failed to delete patient", err);
      setFeedback({ type: "error", message: err?.message || "Bemorni o’chirishda xatolik yuz berdi" });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Ma’lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-white dark:bg-slate-900/60 p-8 text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">Ma’lumotni yuklab bo'lmadi</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/patients")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Bemorlar ro’yxatiga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return null;
  }

  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10"></div>
        <div className="absolute top-40 -right-16 h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10"></div>
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-500/10"></div>
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-12 space-y-8">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <button
            onClick={() => router.push("/patients")}
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>
          <span>/</span>
          <span>Bemor #{patient.id}</span>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`max-w-2xl rounded-xl border px-4 py-3 text-sm shadow-md ${
                feedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300"
                  : "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300"
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 xl:grid-cols-[2fr,1fr]">
          <motion.section
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-sky-500"></div>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{patient.full_name}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      {patient.medical_record_number && (
                        <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
                          MRN: {patient.medical_record_number}
                        </span>
                      )}
                      {age !== null && (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-slate-600 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                          Yoshi: {age}
                        </span>
                      )}
                      {patient.gender && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {patient.gender}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bog’lanish</h3>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-cyan-500" />
                        <span>{patient.phone || "Mavjud emas"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        <span>{patient.email || "Mavjud emas"}</span>
                      </div>
                      <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                        <MapPin className="mt-0.5 w-4 h-4 text-sky-500" />
                        <span>{patient.address || "Manzil kiritilmagan"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ro’yxatdan o'tish</h3>
                    <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>Yaratilgan sana: {formatDate(patient.created_at)}</span>
                      </div>
                      {patient.updated_at && (
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-cyan-500" />
                          <span>Yangilangan: {formatDate(patient.updated_at)}</span>
                        </div>
                      )}
                      {patient.notes && (
                        <p className="rounded-xl border border-slate-200/60 bg-white/70 p-3 text-slate-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                          {patient.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-5 py-2 text-sm font-semibold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-600 dark:border-cyan-500/40 dark:bg-slate-800 dark:text-cyan-300 dark:hover:border-cyan-400/60"
                >
                  <Edit3 className="w-4 h-4" />
                  Tahrirlash
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:border-rose-300 dark:border-rose-500/40 dark:bg-slate-800 dark:text-rose-300 dark:hover:border-rose-400/60"
                >
                  <Trash2 className="w-4 h-4" />
                  O’chirish
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Jami tahlillar", value: stats.totalAnalyses, accent: "from-cyan-500 to-sky-500" },
                { label: "Bajarilgan", value: stats.completed, accent: "from-emerald-500 to-teal-500" },
                { label: "Kutilmoqda", value: stats.pending, accent: "from-amber-500 to-orange-500" },
                { label: "Topilmalar", value: stats.totalFindings, accent: "from-rose-500 to-pink-500" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.accent} px-3 py-1 text-xs font-semibold text-white shadow`}>{item.label}</div>
                  <div className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.aside
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            custom={1}
            className="space-y-6"
          >
            <div className="rounded-3xl border border-slate-200/60 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tahlil xulosasi</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>So’nggi tahlil</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {analyses[0] ? formatDate(analyses[0].created_at) : "Mavjud emas"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dominant kategoriya</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {analyses[0]?.dominant_category || "Aniqlanmagan"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dominant label</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">
                    {analyses[0]?.dominant_label || "Aniqlanmagan"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-200/60 bg-gradient-to-br from-cyan-500/10 via-emerald-500/10 to-sky-500/10 p-6 shadow-xl backdrop-blur dark:border-cyan-500/30">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tezkor ma’lumot</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Tahlillar yangilanishi real vaqtda kuzatiladi
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  Har bir natija tasdiqlangan AI modelidan o'tadi
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-500" />
                  PDF hisobotni eksport qilish imkoniyati mavjud
                </li>
              </ul>
            </div>
          </motion.aside>
        </div>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          custom={2}
          className="rounded-3xl border border-slate-200/60 bg-white/95 p-6 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/70"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tahlillar tarixi</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Bemor bo’yicha barcha tahlil natijalari</p>
            </div>
          </div>

          {analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-10 text-center dark:border-slate-600 dark:bg-slate-900/40">
              <FileText className="w-10 h-10 text-slate-400" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Hozircha tahlil natijalari mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis, index) => {
                const meta = statusMeta(analysis.status);
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm transition hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Tahlil #{analysis.id}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Yaratilgan sana: {formatDate(analysis.created_at)}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                    <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-4">
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Rejim</span>
                        <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{analysis.mode.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Topilmalar</span>
                        <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{analysis.total_findings}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Dominant kategoriya</span>
                        <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{analysis.dominant_category || "Aniqlanmagan"}</p>
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Dominant label</span>
                        <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{analysis.dominant_label || "Aniqlanmagan"}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bemor ma’lumotlarini tahrirlash</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Yopish
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">To’liq ism</label>
                    <input
                      type="text"
                      required
                      value={editForm.full_name}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, full_name: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Tug’ilgan sana</label>
                    <input
                      type="date"
                      value={editForm.date_of_birth}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, date_of_birth: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Tibbiy karta raqami</label>
                    <input
                      type="text"
                      value={editForm.medical_record_number}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, medical_record_number: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Telefon</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Manzil</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Qo’shimcha izoh</label>
                    <textarea
                      rows={4}
                      value={editForm.notes}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, notes: event.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-cyan-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-cyan-700 disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />} Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-2xl dark:border-rose-500/40 dark:bg-slate-900"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Bemorni o’chirishni tasdiqlang</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Ushbu amalni bekor qilib bo’lmaydi. Bemor va unga tegishli barcha tahlil ma’lumotlari o’chiriladi.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 dark:border-slate-600 dark:text-slate-300"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />} O’chirish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

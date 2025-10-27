"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Edit3, Eye, Mail, MapPin, Phone, Plus, Search, Trash2, Users } from "lucide-react";

import { patientAPI } from "@/lib/api";

type Patient = {
  id: number;
  full_name: string;
  medical_record_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  created_at: string;
  updated_at: string;
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

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await patientAPI.list({
          skip: (page - 1) * 20,
          limit: 20,
          search: search || undefined,
        });
        setPatients(data.items || []);
        setTotalPages(data.total_pages || 1);
        setTotalPatients(data.total ?? data.items?.length ?? 0);
      } catch (error) {
        console.error("Failed to fetch patients", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPatients();
  }, [page, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham ushbu bemorni o’chirmoqchimisiz?")) return;

    try {
      setDeletingId(id);
      await patientAPI.delete(id);
      setPatients((prev) => prev.filter((patient) => patient.id !== id));
      setTotalPatients((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete patient", error);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "Mavjud emas";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("uz-UZ");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-10 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/10"></div>
        <div className="absolute top-1/3 -right-16 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10"></div>
      </div>

      <div className="relative z-10 space-y-10 p-6 sm:p-8 lg:p-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:border-cyan-500/30 dark:bg-slate-900/60">
              <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-300" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Jami bemorlar: {totalPatients}</span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Bemorlar boshqaruvi</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bemorlar ro’yxati, kontakt ma’lumotlari va ularning tahlil tarixini kuzatib boring.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/patients/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            Yangi bemor qo’shish
          </motion.button>
        </header>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Bemor nomi yoki tibbiy karta raqami bo’yicha qidirish..."
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-12 py-3 text-sm text-slate-700 shadow-sm backdrop-blur focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-400"
          />
        </motion.div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-3xl border border-slate-200/70 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
              ></div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <Users className="w-12 h-12 text-slate-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Bemorlar topilmadi</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Qidiruv mezonlarini o’zgartirib ko'ring yoki yangi bemor qo’shing.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
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
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{patient.full_name}</h3>
                        {patient.medical_record_number && (
                          <p className="text-xs font-medium text-cyan-600 dark:text-cyan-300">MRN: {patient.medical_record_number}</p>
                        )}
                      </div>
                      <div className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-600 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
                        {formatDate(patient.created_at)}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      {patient.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{formatDate(patient.date_of_birth)}</span>
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                      )}
                      {patient.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 w-4 h-4 text-slate-400" />
                          <span className="line-clamp-2">{patient.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-4 dark:border-slate-700">
                    <button
                      onClick={() => router.push(`/patients/${patient.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
                    >
                      <Eye className="w-4 h-4" />
                      Profil
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/patients/${patient.id}/edit`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                      >
                        <Edit3 className="w-4 h-4" />
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        disabled={deletingId === patient.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:border-rose-400 disabled:opacity-50 dark:border-rose-500/40 dark:text-rose-300"
                      >
                        {deletingId === patient.id ? <LoaderSpinner /> : <Trash2 className="w-4 h-4" />}
                        O’chirish
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Oldingi
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`h-9 w-9 rounded-xl text-xs font-semibold transition ${
                      pageNumber === page
                        ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
            >
              Keyingi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>;
}

import { ChangeEvent, useRef } from "react";
import { UploadCloud } from "lucide-react";

type AnalysisUploadProps = {
  onSelect: (file: File) => void;
  isUploading?: boolean;
  accept?: string;
};

export function AnalysisUpload({
  onSelect,
  isUploading = false,
  accept = "image/*",
}: AnalysisUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
  };

  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <UploadCloud className="mx-auto h-10 w-10 text-cyan-500" />
      <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
        Tahlil uchun rasm yuklang
      </h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Mammografiya yoki klinik rasmni tanlang.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60"
        >
          {isUploading ? "Yuklanmoqda..." : "Fayl tanlash"}
        </button>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          JPG, PNG, DICOM (maks. 25MB)
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error";

type ToastProps = {
  type: ToastType;
  message: string;
  onClose: () => void;
};

export default function Toast({
  type,
  message,
  onClose,
}: ToastProps) {
  const isSuccess = type === "success";

  return (
    <div className="fixed right-6 top-6 z-[100] w-full max-w-sm animate-in fade-in slide-in-from-right-5 duration-200">
      <div
        className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
          isSuccess
            ? "border-emerald-200"
            : "border-red-200"
        }`}
      >
        {/* Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={21} />
          ) : (
            <AlertCircle size={21} />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            {isSuccess ? "Success" : "Something went wrong"}
          </p>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            {message}
          </p>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
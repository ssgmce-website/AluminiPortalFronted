export default function FormField({ label, note, error, required, type = "text", textarea, ...props }) {
  const inputCls = `mt-1 w-full rounded border ${
    error
      ? "border-red-500 text-red-900 focus:border-red-600 focus:ring-1 focus:ring-red-600"
      : "border-slate-300 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
  } px-3 py-2 text-sm outline-none transition disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed read-only:bg-slate-100 read-only:text-slate-600 read-only:cursor-not-allowed`;
  const labelCls = "block text-sm font-semibold text-slate-700";
  const noteCls = "mt-0.5 block text-xs text-slate-500";
  const errorCls = "mt-1 block text-xs font-semibold text-red-600";

  return (
    <label className="block">
      <span className={labelCls}>
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      {note && <span className={noteCls}>{note}</span>}
      {textarea ? (
        <textarea rows={3} className={inputCls} {...props} />
      ) : (
        <input type={type} className={inputCls} {...props} />
      )}
      {error && <span className={errorCls}>{error}</span>}
    </label>
  );
}


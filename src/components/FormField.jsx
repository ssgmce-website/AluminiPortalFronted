export default function FormField({ label, note, required, type = "text", textarea, ...props }) {
  const inputCls =
    "mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";
  const labelCls = "block text-sm font-semibold text-slate-700";
  const noteCls = "mt-0.5 block text-xs text-slate-500";

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
    </label>
  );
}

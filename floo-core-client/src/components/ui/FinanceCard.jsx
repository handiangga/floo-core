export default function FinanceCard({
  title,
  value,
  icon: Icon,
  color,
  isMoney = true,
}) {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-2xl shadow flex justify-between items-center`}
    >
      <div>
        {/* TITLE */}
        <p className="text-sm opacity-90">{title}</p>

        {/* VALUE */}
        {isMoney ? (
          <h1 className="mt-2 flex items-end gap-1">
            <span className="text-xs opacity-80">Rp</span>
            <span className="text-xl font-bold tracking-tight">
              {Number(value || 0).toLocaleString("id-ID")}
            </span>
          </h1>
        ) : (
          <h1 className="text-xl font-bold mt-2">{value ?? 0}</h1>
        )}
      </div>

      {/* ICON */}
      <div className="bg-white/20 p-3 rounded-xl">
        {Icon && <Icon size={20} />}
      </div>
    </div>
  );
}

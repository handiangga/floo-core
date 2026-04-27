import dayjs from "dayjs";
import ActivityItem from "./ActivityItem";

export default function ActivityList({ data = [] }) {
  // =========================================================
  // 🔥 NORMALIZE + SAFE DATA
  // =========================================================
  const safeData = data.map((trx) => ({
    ...trx,
    date: trx.date ? dayjs(trx.date).toDate() : new Date(),
    employee:
      trx.employee && trx.employee !== "-"
        ? trx.employee
        : trx.source === "loan"
          ? "Pencairan"
          : "Pembayaran",
  }));

  // =========================================================
  // 🔥 GROUP BY DATE
  // =========================================================
  const grouped = {};

  safeData.forEach((trx) => {
    const dateKey = dayjs(trx.date).format("YYYY-MM-DD");

    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(trx);
  });

  // =========================================================
  // 🔥 SORT DATE DESC
  // =========================================================
  const sortedDates = Object.keys(grouped).sort((a, b) =>
    dayjs(b).diff(dayjs(a)),
  );

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-4">Aktivitas</h2>

      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {sortedDates.length > 0 ? (
          sortedDates.map((date) => {
            // 🔥 SORT DALAM GROUP (NEWEST FIRST)
            const items = grouped[date].sort((a, b) =>
              dayjs(b.date).diff(dayjs(a.date)),
            );

            return (
              <div key={date}>
                <p className="text-xs text-gray-400 mb-2">
                  {dayjs(date).format("DD MMMM YYYY")}
                </p>

                <div className="space-y-2">
                  {items.map((trx) => (
                    <ActivityItem key={trx.id} trx={trx} />
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-400">Belum ada aktivitas</p>
        )}
      </div>
    </div>
  );
}

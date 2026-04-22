import dayjs from "dayjs";
import ActivityItem from "./ActivityItem";

export default function ActivityList({ data = [] }) {
  const grouped = {};

  data.forEach((trx) => {
    const date = dayjs(trx.date).format("YYYY-MM-DD");
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(trx);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    dayjs(b).diff(dayjs(a)),
  );

  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <h2 className="font-semibold mb-4">Aktivitas</h2>

      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {sortedDates.map((date) => (
          <div key={date}>
            <p className="text-xs text-gray-400 mb-2">
              {dayjs(date).format("DD MMMM YYYY")}
            </p>

            <div className="space-y-2">
              {grouped[date].map((trx) => (
                <ActivityItem key={trx.id} trx={trx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

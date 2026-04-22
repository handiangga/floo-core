export default function StatCard({ title, value, highlight }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h1 className={`text-lg font-bold ${highlight ? "text-blue-600" : ""}`}>
        {value}
      </h1>
    </div>
  );
}

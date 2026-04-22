import CountUp from "react-countup";

export default function AnimatedCard({ title, value, prefix = "", color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow">
      <p className="text-sm text-gray-500">{title}</p>

      <p className={`text-xl font-bold ${color}`}>
        {prefix}
        <CountUp end={value || 0} duration={0.8} separator="." />
      </p>
    </div>
  );
}

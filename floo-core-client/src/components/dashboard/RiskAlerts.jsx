import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";

export default function RiskAlerts({ alerts = [] }) {
  // =====================================================
  // 🔥 EMPTY
  // =====================================================
  if (!alerts.length) return null;

  // =====================================================
  // 🔥 CONFIG
  // =====================================================
  const getConfig = (type) => {
    switch (type) {
      case "danger":
        return {
          icon: AlertTriangle,

          wrapper: "bg-red-50 border-red-200 hover:bg-red-100/70",

          iconBox: "bg-red-100 text-red-600",

          title: "text-red-700",

          desc: "text-red-500",
        };

      case "warning":
        return {
          icon: AlertCircle,

          wrapper: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100/70",

          iconBox: "bg-yellow-100 text-yellow-600",

          title: "text-yellow-700",

          desc: "text-yellow-600",
        };

      case "safe":
      default:
        return {
          icon: ShieldCheck,

          wrapper: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70",

          iconBox: "bg-emerald-100 text-emerald-600",

          title: "text-emerald-700",

          desc: "text-emerald-600",
        };
    }
  };

  return (
    <div className="mt-8">
      {/* ================================================= */}
      {/* 🔥 HEADER */}
      {/* ================================================= */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">Risk Alerts</h2>

        <p className="text-sm text-gray-500 mt-1">
          Monitoring kondisi & risiko bisnis
        </p>
      </div>

      {/* ================================================= */}
      {/* 🔥 ALERT LIST */}
      {/* ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {alerts.map((item, index) => {
          const config = getConfig(item.type);

          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`
                border
                rounded-2xl
                p-5
                transition-all
                duration-200
                shadow-sm
                ${config.wrapper}
              `}
            >
              <div className="flex items-start gap-4">
                {/* ICON */}
                <div
                  className={`
                    w-12 h-12
                    rounded-2xl
                    flex items-center justify-center
                    shrink-0
                    ${config.iconBox}
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <h3
                    className={`
                      font-semibold
                      text-base
                      ${config.title}
                    `}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`
                      text-sm
                      mt-1
                      leading-relaxed
                      ${config.desc}
                    `}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

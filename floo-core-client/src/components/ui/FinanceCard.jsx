import { motion } from "framer-motion";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function FinanceCard({
  title,
  value,
  icon: Icon,
  color,
  isMoney = true,

  // 🔥 NEW
  trend = 0,
  subtitle = "",
  badge = "",
}) {
  // =====================================================
  // 🔥 HELPERS
  // =====================================================
  const safeValue = Number(value || 0);

  const isPositive = trend > 0;

  const isNegative = trend < 0;

  // =====================================================
  // 🔥 TREND CONFIG
  // =====================================================
  const trendColor = isPositive
    ? "text-emerald-200"
    : isNegative
      ? "text-red-200"
      : "text-white/70";

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  // =====================================================
  // 🔥 FORMAT MONEY
  // =====================================================
  const formattedMoney = safeValue.toLocaleString("id-ID");

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{
        duration: 0.2,
      }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${color}
        text-white
        p-6
        rounded-3xl
        shadow-lg
        border border-white/10
        min-h-[125px]
      `}
    >
      {/* ================================================= */}
      {/* 🔥 GLOW EFFECT */}
      {/* ================================================= */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

      {/* ================================================= */}
      {/* 🔥 CONTENT */}
      {/* ================================================= */}
      <div className="relative z-10 flex justify-between items-start h-full">
        {/* LEFT */}
        <div className="flex flex-col justify-between h-full">
          <div>
            {/* TITLE */}
            <p className="text-sm font-medium text-white/80 tracking-wide">
              {title}
            </p>

            {/* VALUE */}
            {isMoney ? (
              <div className="mt-3 flex items-end gap-1">
                <span className="text-sm opacity-80 mb-1">Rp</span>

                <h1 className="text-2xl font-bold tracking-tight leading-none">
                  {formattedMoney}
                </h1>
              </div>
            ) : (
              <h1 className="mt-3 text-2xl font-bold leading-none">
                {safeValue}
              </h1>
            )}

            {/* SUBTITLE */}
            {subtitle && (
              <p className="mt-2 text-xs text-white/70">{subtitle}</p>
            )}
          </div>

          {/* TREND */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`
                flex items-center gap-1
                px-2 py-1 rounded-full
                bg-white/15 backdrop-blur-sm
                text-xs font-medium
                ${trendColor}
              `}
            >
              <TrendIcon size={12} />

              <span>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>

            {badge && <span className="text-xs text-white/70">{badge}</span>}
          </div>
        </div>

        {/* ================================================= */}
        {/* 🔥 ICON */}
        {/* ================================================= */}
        <div
          className="
            bg-white/15
            backdrop-blur-md
            p-4
            rounded-2xl
            border border-white/10
            shadow-lg
          "
        >
          {Icon && <Icon size={26} className="text-white" />}
        </div>
      </div>

      {/* ================================================= */}
      {/* 🔥 BOTTOM LIGHT */}
      {/* ================================================= */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/20" />
    </motion.div>
  );
}

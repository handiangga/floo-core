import Swal from "sweetalert2";

const colorMap = {
  violet: {
    bg: "from-violet-50 to-fuchsia-50",
    border: "border-violet-200",
    text: "text-violet-700",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
    outline:
      "bg-white/80 border border-violet-300 text-violet-700 hover:bg-violet-100",
    glow: "bg-violet-300",
    iconBg: "bg-violet-100 text-violet-700",
  },

  green: {
    bg: "from-green-50 to-emerald-50",
    border: "border-green-200",
    text: "text-green-700",
    button: "bg-green-600 hover:bg-green-700 text-white",
    outline:
      "bg-white/80 border border-green-300 text-green-700 hover:bg-green-100",
    glow: "bg-green-300",
    iconBg: "bg-green-100 text-green-700",
  },

  cyan: {
    bg: "from-cyan-50 to-sky-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    outline:
      "bg-white/80 border border-cyan-300 text-cyan-700 hover:bg-cyan-100",
    glow: "bg-cyan-300",
    iconBg: "bg-cyan-100 text-cyan-700",
  },

  emerald: {
    bg: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline:
      "bg-white/80 border border-emerald-300 text-emerald-700 hover:bg-emerald-100",
    glow: "bg-emerald-300",
    iconBg: "bg-emerald-100 text-emerald-700",
  },

  blue: {
    bg: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    text: "text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    outline:
      "bg-white/80 border border-blue-300 text-blue-700 hover:bg-blue-100",
    glow: "bg-blue-300",
    iconBg: "bg-blue-100 text-blue-700",
  },

  amber: {
    bg: "from-amber-50 to-yellow-50",
    border: "border-amber-200",
    text: "text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
    outline:
      "bg-white/80 border border-amber-300 text-amber-700 hover:bg-amber-100",
    glow: "bg-amber-300",
    iconBg: "bg-amber-100 text-amber-700",
  },
};

export default function LoanDocumentCard({
  title = "Dokumen",
  icon = "📄",
  url,
  color = "violet",
  isImage = false,
  viewLabel,
  downloadLabel = "Download",
}) {
  if (!url) return null;

  const theme = colorMap[color] || colorMap.violet;

  // =====================================
  // VIEW FILE
  // =====================================
  const handleView = () => {
    // IMAGE
    if (isImage) {
      return Swal.fire({
        imageUrl: url,
        imageAlt: title,
        width: 900,
        background: "transparent",
        showConfirmButton: false,
        showCloseButton: true,
        customClass: {
          popup: "rounded-[32px] overflow-hidden shadow-2xl",
        },
      });
    }

    // PDF
    Swal.fire({
      title: `
        <div style="
          font-size:20px;
          font-weight:700;
          color:#111827;
          margin-bottom:10px;
        ">
          ${icon} ${title}
        </div>
      `,
      html: `
        <div style="
          border-radius:20px;
          overflow:hidden;
          border:1px solid #e5e7eb;
        ">
          <iframe
            src="${url}"
            width="100%"
            height="650px"
            style="
              border:none;
              background:white;
            "
          ></iframe>
        </div>
      `,
      width: 1000,
      background: "#f9fafb",
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-[32px] shadow-2xl",
      },
    });
  };

  return (
    <div
      className={`
        relative
        overflow-hidden
        border
        ${theme.border}
        bg-gradient-to-br
        ${theme.bg}
        rounded-[32px]
        p-6
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
      `}
    >
      {/* =====================================
          GLOW
      ===================================== */}
      <div
        className={`
          absolute
          -top-10
          -right-10
          w-40
          h-40
          rounded-full
          blur-3xl
          opacity-20
          ${theme.glow}
        `}
      />

      {/* =====================================
          CONTENT
      ===================================== */}
      <div className="relative">
        {/* =====================================
            HEADER
        ===================================== */}
        <div className="flex items-start gap-4 mb-6">
          {/* ICON */}
          <div
            className={`
              w-14
              h-14
              rounded-2xl
              flex
              items-center
              justify-center
              text-2xl
              shadow-sm
              ${theme.iconBg}
            `}
          >
            {icon}
          </div>

          {/* TITLE */}
          <div>
            <p
              className={`
                ${theme.text}
                font-bold
                text-lg
              `}
            >
              {title}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Dokumen tersedia untuk dilihat dan diunduh.
            </p>
          </div>
        </div>

        {/* =====================================
            ACTIONS
        ===================================== */}
        <div className="flex gap-3 flex-wrap">
          {/* VIEW */}
          <button
            onClick={handleView}
            className={`
              ${theme.button}
              px-5
              py-3
              rounded-2xl
              transition-all
              duration-300
              font-semibold
              hover:scale-[1.02]
              shadow-sm
            `}
          >
            {viewLabel || (isImage ? "Lihat Bukti" : "Lihat PDF")}
          </button>

          {/* DOWNLOAD */}
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={`
              ${theme.outline}
              px-5
              py-3
              rounded-2xl
              transition-all
              duration-300
              font-semibold
              hover:scale-[1.02]
              backdrop-blur-sm
            `}
          >
            ⬇ {downloadLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

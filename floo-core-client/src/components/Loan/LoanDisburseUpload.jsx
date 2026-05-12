import Swal from "sweetalert2";

const colorMap = {
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
    outline:
      "bg-white border border-violet-300 text-violet-700 hover:bg-violet-100",
  },

  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    button: "bg-green-600 hover:bg-green-700 text-white",
    outline:
      "bg-white border border-green-300 text-green-700 hover:bg-green-100",
  },

  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    outline: "bg-white border border-cyan-300 text-cyan-700 hover:bg-cyan-100",
  },

  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline:
      "bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100",
  },

  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "bg-white border border-blue-300 text-blue-700 hover:bg-blue-100",
  },

  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
    outline:
      "bg-white border border-amber-300 text-amber-700 hover:bg-amber-100",
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

  // =========================
  // VIEW FILE
  // =========================
  const handleView = () => {
    // IMAGE
    if (isImage) {
      return Swal.fire({
        imageUrl: url,
        imageAlt: title,
        width: 700,
        showConfirmButton: false,
        showCloseButton: true,
        background: "#fff",
      });
    }

    // PDF / DOC
    Swal.fire({
      title,
      html: `
        <iframe
          src="${url}"
          width="100%"
          height="600px"
          style="
            border:none;
            border-radius:12px;
          "
        ></iframe>
      `,
      width: 900,
      showCloseButton: true,
      showConfirmButton: false,
    });
  };

  return (
    <div
      className={`
        ${theme.bg}
        ${theme.border}
        border
        rounded-3xl
        p-6
      `}
    >
      {/* TITLE */}
      <p
        className={`
          ${theme.text}
          font-semibold
          mb-4
          text-lg
        `}
      >
        {icon} {title}
      </p>

      {/* ACTION */}
      <div className="flex gap-3 flex-wrap">
        {/* VIEW */}
        <button
          onClick={handleView}
          className={`
            ${theme.button}
            px-5
            py-3
            rounded-2xl
            transition
            font-medium
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
            transition
            font-medium
          `}
        >
          {downloadLabel}
        </a>
      </div>
    </div>
  );
}

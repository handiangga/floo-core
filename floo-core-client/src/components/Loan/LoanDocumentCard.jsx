import Swal from "sweetalert2";

const colorMap = {
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    title: "text-violet-700",
    button: "bg-violet-600 hover:bg-violet-700 text-white",
    outline: "border border-violet-300 text-violet-700 hover:bg-violet-100",
  },

  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    title: "text-green-700",
    button: "bg-green-600 hover:bg-green-700 text-white",
    outline: "border border-green-300 text-green-700 hover:bg-green-100",
  },

  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    title: "text-cyan-700",
    button: "bg-cyan-600 hover:bg-cyan-700 text-white",
    outline: "border border-cyan-300 text-cyan-700 hover:bg-cyan-100",
  },

  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    title: "text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    outline: "border border-emerald-300 text-emerald-700 hover:bg-emerald-100",
  },
};

export default function LoanDocumentCard({
  title,
  icon,
  url,
  color = "violet",
  isImage = false,
  viewLabel = "Lihat",
}) {
  if (!url) return null;

  const theme = colorMap[color] || colorMap.violet;

  const handleView = () => {
    if (isImage) {
      Swal.fire({
        imageUrl: url,
        imageAlt: title,
        showConfirmButton: false,
        showCloseButton: true,
        width: 700,
      });

      return;
    }

    Swal.fire({
      title,
      html: `
        <iframe
          src="${url}"
          width="100%"
          height="600px"
          style="border:none;border-radius:12px;"
        ></iframe>
      `,
      width: 900,
      showConfirmButton: false,
      showCloseButton: true,
    });
  };

  return (
    <div
      className={`
        ${theme.bg}
        ${theme.border}
        border
        rounded-[28px]
        p-6
        shadow-sm
      `}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <div className="text-2xl">{icon}</div>

        <div>
          <h3 className={`${theme.title} font-bold text-lg`}>{title}</h3>

          <p className="text-gray-500 text-sm">
            Dokumen tersedia untuk dilihat dan diunduh.
          </p>
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleView}
          className={`
            ${theme.button}
            px-5
            py-3
            rounded-2xl
            font-medium
            transition
          `}
        >
          {viewLabel}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={`
            ${theme.outline}
            px-5
            py-3
            rounded-2xl
            font-medium
            transition
            bg-white
          `}
        >
          Download
        </a>
      </div>
    </div>
  );
}

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { uploadToSupabase } from "../../utils/uploadSupabase";

export default function UploadPro({
  label,
  preview,
  setPreview,
  setValue,
  large,
}) {
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const url = await uploadToSupabase(file, setProgress);
    setValue(url);
  };

  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleUpload(e.dataTransfer.files[0]);
        }}
        className={`
          mt-2 flex flex-col items-center justify-center
          border-2 border-dashed rounded-xl p-6 cursor-pointer transition
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        `}
      >
        {preview ? (
          <img
            src={preview}
            className={`rounded-xl object-cover ${
              large ? "w-40 h-40" : "w-24 h-24"
            }`}
          />
        ) : (
          <>
            <UploadCloud className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">
              Drag & drop atau klik upload
            </p>
          </>
        )}

        {/* progress */}
        {progress > 0 && progress < 100 && (
          <div className="w-full mt-3">
            <div className="h-2 bg-gray-200 rounded">
              <div
                style={{ width: `${progress}%` }}
                className="h-2 bg-blue-500 rounded transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Uploading {progress}%</p>
          </div>
        )}

        <input
          type="file"
          hidden
          onChange={(e) => handleUpload(e.target.files[0])}
        />
      </div>
    </div>
  );
}

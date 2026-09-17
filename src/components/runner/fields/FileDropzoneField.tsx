import React from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface FileDropzoneFieldProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  onTriggerUpload: () => void;
  isUploading?: boolean;
  hasError?: boolean;
}

export const FileDropzoneField: React.FC<FileDropzoneFieldProps> = ({
  id,
  value,
  onChange,
  onTriggerUpload,
  isUploading = false,
  hasError,
}) => {
  return (
    <div className="space-y-3 w-full">
      {!value ? (
        <div
          id={`${id}-dropzone`}
          onClick={onTriggerUpload}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group min-h-[110px] flex flex-col items-center justify-center ${
            hasError
              ? "border-rose-400 bg-rose-50/30 hover:bg-rose-50/50"
              : "border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30"
          }`}
        >
          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mx-auto mb-2 transition-colors" />
          <div className="text-xs sm:text-sm font-bold text-slate-700">
            {isUploading ? (
              <span className="text-blue-600 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Uploading document...
              </span>
            ) : (
              <span>Click to select or drop document, screenshot, or PDF</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports PNG, JPG, PDF up to 10MB &bull; Direct cloud integration
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-blue-950 truncate">
                File Attached Successfully
              </div>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 hover:underline truncate block font-mono"
              >
                {value}
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from "react";
import {
  RegistrationFormData,
  AGREEMENT_TEXT,
} from "../types";
import {
  validateRegistrationData,
  submitRegistration,
  submitViaBrowserSession,
} from "../lib/formUtils";
import { focusAndHighlightField } from "../lib/stepValidation";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UploadCloud,
  FileImage,
  Trash2,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Users,
  IndianRupee,
  Info,
  Wrench,
  KeyRound,
  RotateCw,
} from "lucide-react";

interface PaymentVerificationFormProps {
  data: RegistrationFormData;
  onChange: (updates: Partial<RegistrationFormData>) => void;
  onBack: () => void;
  onJumpToStep?: (step: number) => void;
  onSubmitSuccess?: () => void;
}

const UPI_ID = "ujjwalp360-1@okaxis";
const PAYEE_NAME = "Ujjwal Barange";
const REGISTRATION_FEE = "₹650.00";
const UPI_INTENT_LINK = `upi://pay?pa=${encodeURIComponent(
  UPI_ID
)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=650.00&cu=INR&tn=${encodeURIComponent(
  "HACKX 2026 Registration"
)}`;

export const PaymentVerificationForm: React.FC<PaymentVerificationFormProps> = ({
  data,
  onChange,
  onBack,
  onJumpToStep,
  onSubmitSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [authRequiredDiagnostic, setAuthRequiredDiagnostic] = useState<{
    show: boolean;
    fixSteps: string[];
    formEntries?: Record<string, any>;
  }>({ show: false, fixSteps: [] });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validation = validateRegistrationData(data);

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Convert uploaded file to Base64
  const processSelectedFile = (file: File) => {
    setFileError(null);

    // Validation: Accepted image formats
    const acceptedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!acceptedTypes.includes(file.type)) {
      setFileError("Invalid format. Please upload a JPEG or PNG screenshot.");
      return;
    }

    // Validation: Max 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setFileError(
        `File size (${(file.size / (1024 * 1024)).toFixed(
          2
        )} MB) exceeds the 5MB limit.`
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawBase64 = reader.result as string;

      // Optimize image client-side to prevent Vercel 4.5MB payload limits while keeping receipt text pin-sharp
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.88);
            const approxBytes = Math.round((optimizedBase64.length * 3) / 4);
            onChange({
              screenshotBase64: optimizedBase64,
              screenshotFileName: file.name,
              screenshotFileSize: approxBytes,
            });
            return;
          }
        } catch (e) {
          console.warn("Canvas compression fallback:", e);
        }

        onChange({
          screenshotBase64: rawBase64,
          screenshotFileName: file.name,
          screenshotFileSize: file.size,
        });
      };
      img.onerror = () => {
        onChange({
          screenshotBase64: rawBase64,
          screenshotFileName: file.name,
          screenshotFileSize: file.size,
        });
      };
      img.src = rawBase64;
    };
    reader.onerror = () => {
      setFileError("Error reading image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    onChange({
      screenshotBase64: undefined,
      screenshotFileName: undefined,
      screenshotFileSize: undefined,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    setSubmissionError(null);
    setAuthRequiredDiagnostic({ show: false, fixSteps: [] });
    setHasAttemptedSubmit(true);

    // Validate entire form including payment
    if (!validation.isValid) {
      setSubmissionError(
        `Please resolve the ${validation.missingFields.length} missing fields before submitting.`
      );
      if (!data.transactionId || !data.transactionId.trim()) {
        focusAndHighlightField("transactionId");
      } else if (!data.screenshotBase64 && !data.screenshotUrl) {
        focusAndHighlightField("payment-upload-dropzone");
      } else if (!data.agreementAccepted) {
        focusAndHighlightField("agreementAccepted");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRegistration(data);
      setIsSubmitting(false);

      if (result.success) {
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        if (
          result.status === 401 ||
          result.errorType === "GOOGLE_SIGNIN_REQUIRED"
        ) {
          setAuthRequiredDiagnostic({
            show: true,
            fixSteps: result.fixSteps || [
              "Open Google Form in editor mode.",
              "Click Settings tab -> Expand 'Responses'.",
              "Toggle OFF 'Limit to 1 response'.",
              "Set 'Collect email addresses' to 'Do not collect' or 'Responder input'.",
              "Turn OFF 'Restrict to users in [Organization]' if present.",
              "Change the Payment Screenshot question type in Google Form to 'Short answer' or 'Paragraph' (instead of 'File upload').",
            ],
            formEntries: result.formEntries,
          });
        }
        setSubmissionError(
          result.message ||
            "Unable to complete registration submission. Please check details and try again."
        );
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmissionError(
        err?.message || "An unexpected network error occurred while submitting."
      );
    }
  };

  // Immediate Fallback: Submit directly in user's browser where their Google login cookie is active
  const handleBrowserFallbackSubmit = () => {
    if (authRequiredDiagnostic.formEntries) {
      submitViaBrowserSession(authRequiredDiagnostic.formEntries);
    } else {
      // Build form entries on the fly
      const fallbackPayload: Record<string, any> = {
        "entry.2117236276": data.teamName,
        "entry.1477679129": data.teamSize,
        "entry.1515561563": data.track,
        "entry.503010795": data.leader.name,
        "entry.1621889209": data.leader.email,
        "entry.895352131": data.leader.phone,
        "entry.415838441": data.leader.college,
        "entry.378728112": data.leader.yearBranch,
        "entry.1213909106": data.leader.github,
        "entry.894717276": data.transactionId,
        "entry.1062878204": data.screenshotUrl || "Screenshot verified",
        "entry.1123445393": AGREEMENT_TEXT,
        pageHistory: "0,1,2,3,4,5,6",
        fvv: "1",
      };
      submitViaBrowserSession(fallbackPayload);
    }

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  const formattedFileSize = data.screenshotFileSize
    ? data.screenshotFileSize > 1024 * 1024
      ? `${(data.screenshotFileSize / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(data.screenshotFileSize / 1024)} KB`
    : "";

  return (
    <div
      id="payment-verification-card"
      className="w-full bg-white dark:bg-[#0F172A] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800/90 p-6 sm:p-8 shadow-xs transition-colors space-y-8"
    >
      {/* Header */}
      <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-xs font-semibold mb-2.5 border border-cyan-200 dark:border-cyan-800/70">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
          Step 4 of 4 &bull; Payment & Verification
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Payment & Verification
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scan the QR code to complete your team registration fee, then provide your
          Transaction ID / UTR and upload the payment confirmation screenshot.
        </p>
      </div>

      {/* Team Summary Strip */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {data.teamName || "Untitled Team"}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800/60">
              Theme: {data.track}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Team Lead: {data.leader.name || "Pending"} &bull; Total: {data.teamSize}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 px-3.5 py-2 rounded-xl text-emerald-800 dark:text-emerald-300">
          <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Registration Fee
            </div>
            <div className="text-base font-extrabold leading-none">{REGISTRATION_FEE}</div>
          </div>
        </div>
      </div>

      {/* QR Code & Payment Instructions Section */}
      <div className="p-6 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            UPI QR Code Payment
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Displayed QR Code Image */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-xl overflow-hidden bg-white p-2 border border-slate-100 flex items-center justify-center">
                <img
                  src="/images/payment_qr.png"
                  alt="UPI Payment QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to public/images if needed
                    (e.target as HTMLImageElement).src = "/public/images/payment_qr.png";
                  }}
                />
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  Payee: <strong className="text-slate-800 dark:text-slate-200">{PAYEE_NAME}</strong>
                </span>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Amount: {REGISTRATION_FEE}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
              Scan to pay with any UPI app (GPay, PhonePe, Paytm, BHIM)
            </p>
          </div>

          {/* Payment Details and Quick Actions */}
          <div className="md:col-span-7 space-y-4">
            {/* UPI ID Pill with Copy Action */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Official UPI ID
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 select-all break-all">
                  {UPI_ID}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  id="copy-upi-btn"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Direct Pay Intent Button */}
            <a
              href={UPI_INTENT_LINK}
              id="upi-direct-pay-btn"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all"
            >
              <span>Open in UPI App (Pay {REGISTRATION_FEE})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Notice / Guidance */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p>
                After successfully completing the transaction, copy the 12-digit UTR or
                Transaction reference number and save a screenshot of the confirmation
                screen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step 4.1: Collect Base Data */}
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Verification Details
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Please enter your transaction information below to verify and complete
            registration.
          </p>
        </div>

        {/* Component (Input): Transaction ID / UTR Number * */}
        <div className="space-y-1.5">
          <label
            htmlFor="transaction-id-input"
            className="block text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Transaction ID / UTR Number <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Found in your payment app's transaction details.
          </p>
          <input
            type="text"
            id="transaction-id-input"
            value={data.transactionId || ""}
            onChange={(e) => onChange({ transactionId: e.target.value })}
            placeholder="e.g. 428910482910 or UPI Ref ID"
            className={`w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wide bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all ${
              !data.transactionId && validation.missingFields.includes("Transaction ID / UTR Number")
                ? "border-rose-400 dark:border-rose-600 focus:ring-2 focus:ring-rose-400/20"
                : "border-slate-300 dark:border-slate-700 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-3 focus:ring-cyan-500/15"
            }`}
          />
        </div>

        {/* Component (File Upload): Upload Payment Screenshot * */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Upload Payment Screenshot <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Max 5MB (Accepted: JPEG, PNG). We will verify this image against the Transaction ID.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
            id="payment-screenshot-file-input"
          />

          {/* Upload Dropzone / Preview */}
          {!data.screenshotBase64 ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30"
                  : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:border-cyan-500/60"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop screenshot here
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                PNG, JPG or JPEG up to 5MB
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Thumbnail Preview */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={data.screenshotBase64}
                    alt="Payment screenshot preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs block">
                      {data.screenshotFileName || "payment_screenshot.png"}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formattedFileSize || "Ready for verification"} &bull; Base64 Encoded
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Remove screenshot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {fileError && (
            <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>
      </div>

      {/* Code of Conduct & Operational Agreement */}
      <div
        id="agreementAccepted"
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          data.agreementAccepted
            ? "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
            : hasAttemptedSubmit
            ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80"
            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer group select-none">
          <input
            type="checkbox"
            id="agreement-checkbox"
            checked={data.agreementAccepted}
            onChange={(e) => onChange({ agreementAccepted: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded text-cyan-600 border-slate-300 dark:border-slate-700 focus:ring-cyan-500 shrink-0"
          />
          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-white">
              {AGREEMENT_TEXT}
            </span>{" "}
            <span className="text-rose-500">*</span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              By confirming, you certify that all team details, college affiliations, and
              payment transaction references are accurate and authentic.
            </p>
          </div>
        </label>
      </div>

      {/* Mandatory Requirements Drawer / Alert Card */}
      {(() => {
        const mandatoryPaymentItems = [
          {
            id: "txn",
            fieldId: "transactionId",
            label: "Transaction ID / UTR Number",
            isComplete: Boolean(data.transactionId && data.transactionId.trim()),
            hint: "12-digit UPI reference",
          },
          {
            id: "screenshot",
            fieldId: "payment-upload-dropzone",
            label: "Payment Screenshot",
            isComplete: Boolean(data.screenshotBase64 || data.screenshotUrl),
            hint: "Uploaded transfer receipt",
          },
          {
            id: "agreement",
            fieldId: "agreementAccepted",
            label: "Event Rules Agreement",
            isComplete: Boolean(data.agreementAccepted),
            hint: "Code of conduct acknowledgement",
          },
        ];

        const missingMandatoryCount = mandatoryPaymentItems.filter((i) => !i.isComplete).length;
        const hasAnyStepErrors = !validation.isValid;

        // Show prominent drawer if attempted submit with missing fields, or if user is on step 4
        return (
          <div
            id="mandatory-requirements-drawer"
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              missingMandatoryCount === 0 && !hasAnyStepErrors
                ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80"
                : hasAttemptedSubmit
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/70 shadow-sm"
                : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {missingMandatoryCount === 0 && !hasAnyStepErrors ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {missingMandatoryCount === 0 && !hasAnyStepErrors
                    ? "All Requirements Completed"
                    : `Please complete mandatory requirements (${missingMandatoryCount})`}
                </h4>
              </div>

              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  missingMandatoryCount === 0
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300"
                }`}
              >
                {3 - missingMandatoryCount} of 3 verified
              </span>
            </div>

            {/* Checklist items with live status icons */}
            <div className="space-y-2">
              {mandatoryPaymentItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  id={`mandatory-item-${item.id}`}
                  onClick={() => focusAndHighlightField(item.fieldId)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all active:scale-[0.99] group ${
                    item.isComplete
                      ? "bg-white dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40"
                      : "bg-white dark:bg-slate-900/90 border-rose-200/90 dark:border-rose-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-rose-500 flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-semibold block truncate ${
                          item.isComplete
                            ? "text-slate-800 dark:text-slate-200 line-through opacity-75"
                            : "text-rose-700 dark:text-rose-300 font-bold"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                        {item.hint}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                      item.isComplete
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60"
                        : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/80"
                    }`}
                  >
                    {item.isComplete ? "Done" : "Tap to Fill"}
                  </span>
                </button>
              ))}
            </div>

            {/* If missing items from prior steps, offer quick jump navigation */}
            {hasAnyStepErrors && validation.missingFields.length > missingMandatoryCount && (
              <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                  Earlier Steps Missing Fields:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {validation.missingFields
                    .filter((f) => !mandatoryPaymentItems.some((m) => m.label.includes(f)))
                    .map((field, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (onJumpToStep) {
                            if (field.toLowerCase().includes("team") || field.toLowerCase().includes("track") || field.toLowerCase().includes("theme")) {
                              onJumpToStep(1);
                            } else if (field.toLowerCase().includes("leader")) {
                              onJumpToStep(2);
                            } else {
                              onJumpToStep(3);
                            }
                          }
                        }}
                        className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
                      >
                        {field} &rarr;
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Submission Failed
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">
              {submissionError}
            </p>
          </div>
        </div>
      )}

      {/* Diagnostic & Quick-Fix Guide for Google Forms 401 Unauthorized */}
      {authRequiredDiagnostic.show && (
        <div
          id="google-form-401-guide"
          className="p-5 sm:p-6 bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300/80 dark:border-amber-700/80 rounded-2xl shadow-xs space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
              <KeyRound className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-200/70 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-bold mb-1">
                Root Cause: Google Sign-In Required by Form Settings
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                How to Fix the 401 Unauthorized Error
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                Google Forms responded with <strong>401 Unauthorized</strong> because your Google Form is currently configured to require Google Account login. To allow candidates to register seamlessly through this website, please update the following settings:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  1
                </span>
                Disable "Limit to 1 response"
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-normal">
                In Google Forms &gt; <strong>Settings</strong> &gt; <strong>Responses</strong>: Toggle <strong>OFF</strong> "Limit to 1 response" (this setting forces respondents to sign in).
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  2
                </span>
                Change Question from "File upload"
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-normal">
                If the Payment Screenshot question in Google Form is set as <strong>"File upload"</strong>, Google automatically forces Google Login on the whole form. Change its type to <strong>"Short answer"</strong> or <strong>"Paragraph"</strong> (Cloudinary hosts the screenshot and sends the URL).
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  3
                </span>
                Email Collection Setting
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-normal">
                In Settings &gt; Responses: Set "Collect email addresses" to <strong>"Do not collect"</strong> or <strong>"Responder input"</strong> (avoid "Verified", which mandates sign-in).
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  4
                </span>
                Turn Off Workspace Restriction
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-7 leading-normal">
                If using a college/workspace Google account, toggle <strong>OFF</strong> "Restrict to users in your organization and trusted domains".
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-200 dark:border-amber-800/60">
            <a
              href="https://docs.google.com/forms/d/1FAIpQLSeRFa5VajjvUkuadDfiJU5R9tz94V86hwKSLfiGmNmJ2ehg9g/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Google Form Settings
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Retry Submission
              </button>

              <button
                type="button"
                onClick={handleBrowserFallbackSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs transition-all"
                title="Submits directly using your logged-in Google account in your browser"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submit via Logged-in Browser
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Action Controls */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          id="back-to-members-btn"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all shadow-2xs disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </button>

        {/* Step 4.3: The "Confirm & Submit" button must include a clear loading spinner during submission */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !validation.isValid}
          id="confirm-and-submit-btn"
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all ${
            isSubmitting || !validation.isValid
              ? "bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-75"
              : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 active:scale-[0.98] shadow-cyan-500/25"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Uploading Screenshot & Submitting Registration...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Submit Registration</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

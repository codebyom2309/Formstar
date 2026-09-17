import React from "react";
import { FormField } from "../../types";
import { ExperienceQuestion, CanonicalComponentType } from "../../types/canonicalExperience";
import { RadioCardsField } from "./fields/RadioCardsField";
import { CheckboxCardsField } from "./fields/CheckboxCardsField";
import { RatingCardsField } from "./fields/RatingCardsField";
import { ScaleSelectorField } from "./fields/ScaleSelectorField";
import { QuizOptionField } from "./fields/QuizOptionField";
import { FileDropzoneField } from "./fields/FileDropzoneField";
import { InputField } from "./fields/InputField";
import { AlertCircle } from "lucide-react";

interface CanonicalFieldRendererProps {
  field: FormField;
  experienceQuestion?: ExperienceQuestion;
  value: any;
  onChange: (val: any) => void;
  error?: string;
  onTriggerUpload: (field: FormField) => void;
  isUploading?: boolean;
}

export const CanonicalFieldRenderer: React.FC<CanonicalFieldRendererProps> = ({
  field,
  experienceQuestion,
  value,
  onChange,
  error,
  onTriggerUpload,
  isUploading = false,
}) => {
  // Resolve component type
  let compType: CanonicalComponentType = experienceQuestion?.recommendedComponent || "TextInput";

  if (!experienceQuestion?.recommendedComponent) {
    if (field.type === "radio") compType = "RadioCards";
    else if (field.type === "checkbox") compType = "CheckboxCards";
    else if (field.type === "dropdown") compType = "Select";
    else if (field.type === "paragraph") compType = "Textarea";
    else if (field.type === "upload") compType = "FileDropzone";
    else if (field.validationType === "email") compType = "EmailInput";
    else if (field.validationType === "phone") compType = "PhoneInput";
    else if (field.validationType === "number") compType = "NumberInput";
    else if (field.validationType === "url") compType = "URLInput";
  }

  // Label & Subtitle
  const label = experienceQuestion?.label || field.label;
  const description = experienceQuestion?.description || field.description || field.helpText;
  const isRequired = experienceQuestion?.required ?? field.required;

  return (
    <div className="space-y-2 w-full">
      {/* Label and badges */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <label className="text-xs sm:text-sm font-bold text-slate-800 break-words max-w-full">
          <span>{label}</span>
          {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
        </label>

        <div className="flex items-center gap-1.5 flex-wrap">
          {experienceQuestion?.semanticRole && experienceQuestion.semanticRole !== "unknown" && (
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md border border-slate-200/60">
              {experienceQuestion.semanticRole.replace(/_/g, " ")}
            </span>
          )}

          {experienceQuestion?.quizMetadata?.points && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
              {experienceQuestion.quizMetadata.points} pts
            </span>
          )}
        </div>
      </div>

      {/* Description / Subtext */}
      {description && (
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed break-words">
          {description}
        </p>
      )}

      {/* Component Rendering */}
      <div className="pt-0.5">
        {compType === "RadioCards" && (
          <RadioCardsField
            id={field.id}
            options={field.options || experienceQuestion?.options || []}
            value={value}
            onChange={onChange}
            hasError={Boolean(error)}
          />
        )}

        {compType === "CheckboxCards" && (
          <CheckboxCardsField
            id={field.id}
            options={field.options || experienceQuestion?.options || []}
            value={value}
            onChange={onChange}
            hasError={Boolean(error)}
          />
        )}

        {compType === "RatingCards" && (
          <RatingCardsField
            id={field.id}
            value={value}
            onChange={onChange}
            max={experienceQuestion?.scaleMax || 5}
            hasError={Boolean(error)}
          />
        )}

        {compType === "ScaleSelector" && (
          <ScaleSelectorField
            id={field.id}
            value={value}
            onChange={onChange}
            min={experienceQuestion?.scaleMin || 1}
            max={experienceQuestion?.scaleMax || 10}
            minLabel={experienceQuestion?.scaleMinLabel || "Low"}
            maxLabel={experienceQuestion?.scaleMaxLabel || "High"}
            hasError={Boolean(error)}
          />
        )}

        {compType === "QuizOption" && (
          <QuizOptionField
            id={field.id}
            options={field.options || experienceQuestion?.options || []}
            value={value}
            onChange={onChange}
            hasError={Boolean(error)}
          />
        )}

        {compType === "FileDropzone" && (
          <FileDropzoneField
            id={field.id}
            value={value}
            onChange={onChange}
            onTriggerUpload={() => onTriggerUpload(field)}
            isUploading={isUploading}
            hasError={Boolean(error)}
          />
        )}

        {/* Input fields: TextInput, EmailInput, PhoneInput, NumberInput, DatePicker, TimePicker, URLInput, Select, Textarea */}
        {[
          "TextInput",
          "EmailInput",
          "PhoneInput",
          "NumberInput",
          "DatePicker",
          "TimePicker",
          "URLInput",
          "Select",
          "Textarea",
        ].includes(compType) && (
          <InputField
            id={field.id}
            type={compType}
            value={value}
            onChange={onChange}
            placeholder={field.placeholder || experienceQuestion?.placeholder}
            options={field.options || experienceQuestion?.options}
            hasError={Boolean(error)}
          />
        )}
      </div>

      {/* Validation error message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pt-1 animate-in fade-in duration-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}
    </div>
  );
};

import React from "react";
import {
  Mail,
  Phone,
  Hash,
  Globe,
  Calendar,
  Clock,
  ChevronDown,
} from "lucide-react";
import { CanonicalComponentType } from "../../../types/canonicalExperience";

interface InputFieldProps {
  id: string;
  type: CanonicalComponentType | string;
  value: any;
  onChange: (val: any) => void;
  placeholder?: string;
  options?: string[];
  hasError?: boolean;
  min?: number;
  max?: number;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  type,
  value,
  onChange,
  placeholder,
  options = [],
  hasError,
  min,
  max,
}) => {
  const strVal = value !== undefined && value !== null ? String(value) : "";

  // Common input styling with Glassmorphism and tactile inset depth
  const baseInputClasses = `w-full text-xs sm:text-sm rounded-xl border bg-white/95 backdrop-blur-md transition-all duration-150 min-h-[46px] text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.03)] focus:shadow-[inset_0_1px_1px_rgba(0,0,0,0.02),0_0_0_3px_rgba(37,99,235,0.12)] focus:outline-none ${
    hasError
      ? "border-rose-400 focus:border-rose-500 text-rose-950 ring-2 ring-rose-200"
      : "border-slate-300 hover:border-slate-400 focus:border-blue-600"
  }`;

  // Email Input
  if (type === "EmailInput") {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Mail className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "name@example.com"}
          className={`${baseInputClasses} pl-10 pr-3.5 py-2.5`}
        />
      </div>
    );
  }

  // Phone Input
  if (type === "PhoneInput") {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Phone className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="tel"
          autoComplete="tel"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "+91 98765 43210"}
          className={`${baseInputClasses} pl-10 pr-3.5 py-2.5`}
        />
      </div>
    );
  }

  // Number Input
  if (type === "NumberInput") {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Hash className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter number..."}
          className={`${baseInputClasses} pl-10 pr-3.5 py-2.5`}
        />
      </div>
    );
  }

  // URL Input
  if (type === "URLInput") {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Globe className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="url"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://github.com/profile"}
          className={`${baseInputClasses} pl-10 pr-3.5 py-2.5`}
        />
      </div>
    );
  }

  // Date Picker
  if (type === "DatePicker") {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="date"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClasses} pl-10 pr-3.5 py-2.5`}
        />
      </div>
    );
  }

  // Time Picker
  if (type === "TimePicker") {
    return (
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Clock className="w-4 h-4" />
        </div>
        <input
          id={id}
          type="time"
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClasses} pl-10 pr-3.5 py-2.5`}
        />
      </div>
    );
  }

  // Select / Dropdown
  if (type === "Select") {
    return (
      <div className="relative w-full">
        <select
          id={id}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClasses} px-3.5 py-2.5 appearance-none pr-10 cursor-pointer`}
        >
          <option value="">{placeholder || "-- Select an option --"}</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Textarea
  if (type === "Textarea") {
    return (
      <div className="relative w-full">
        <textarea
          id={id}
          rows={3}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Type your detailed answer here..."}
          className={`${baseInputClasses} px-3.5 py-2.5 resize-y min-h-[90px]`}
        />
        {strVal.length > 0 && (
          <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
            {strVal.length} characters
          </div>
        )}
      </div>
    );
  }

  // Default Standard TextInput
  return (
    <input
      id={id}
      type="text"
      value={strVal}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Your answer..."}
      className={`${baseInputClasses} px-3.5 py-2.5`}
    />
  );
};

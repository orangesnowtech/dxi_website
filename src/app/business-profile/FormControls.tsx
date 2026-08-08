"use client";

import type { ReactNode } from "react";

/**
 * Form primitives for the business profile, in the site's design language:
 * hard 2px borders that turn red on focus, mono labels, and a lettered tag on
 * each section heading.
 */

const CONTROL =
  "w-full border-2 border-line bg-paper px-3.5 py-[13px] font-body text-[15px] text-ink transition-colors focus:border-signal focus:outline-none disabled:cursor-not-allowed disabled:bg-ash disabled:text-smoke disabled:opacity-70";

export function SectionLabel({ tag, children }: { tag: string; children: ReactNode }) {
  return (
    <div className="mb-7 flex items-baseline gap-3.5 border-b-[3px] border-ink pb-3">
      <span className="bg-ink px-[11px] py-1 font-mono text-[13px] font-semibold tracking-[0.08em] text-white">
        {tag}
      </span>
      <h2 className="font-disp text-[clamp(19px,2.6vw,26px)] uppercase leading-none">{children}</h2>
    </div>
  );
}

export function Field({
  children,
  half = false,
  className = "",
}: {
  children: ReactNode;
  half?: boolean;
  className?: string;
}) {
  // `half` pairs two fields per row above the narrow breakpoint.
  return (
    <div className={`mb-6 ${half ? "wide:w-[calc(50%-9px)]" : ""} ${className}`}>{children}</div>
  );
}

/** Wraps `half` fields so they sit side by side and collapse together. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-x-[18px] wide:flex-row">{children}</div>;
}

export function Label({
  htmlFor,
  required = false,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block font-mono text-[13px] font-medium tracking-[0.02em]"
    >
      {children}
      {required && <span className="text-signal"> *</span>}
    </label>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return <div className="mt-1.5 text-[12.5px] text-smoke">{children}</div>;
}

export function TextInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  type = "text",
  required = false,
  placeholder,
  inputMode,
  ref,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      placeholder={placeholder}
      inputMode={inputMode}
      className={CONTROL}
      {...rest}
    />
  );
}

export function Select({
  id,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  options,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options: string[];
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      // A disabled control is skipped by browser validation, so `required`
      // never blocks submission on a question that no longer applies.
      required={required}
      disabled={disabled}
      aria-disabled={disabled}
      className={`${CONTROL} form-select pr-10`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function TextArea({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className={`${CONTROL} min-h-[100px] resize-y`}
    />
  );
}

/** Revealed when an answer calls for follow-up questions. */
export function Conditional({ when, children }: { when: boolean; children: ReactNode }) {
  if (!when) return null;
  return (
    <div className="conditional-panel mt-1 border-l-2 border-signal pl-5">{children}</div>
  );
}

/** Grey explanatory panel with a red rule — used for the financing preamble. */
export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[30px] border-l-[3px] border-signal bg-ash px-5 py-4 text-[14.5px] leading-[1.55] text-[#333]">
      {children}
    </div>
  );
}

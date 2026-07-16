"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormField {
  id:          string;
  label:       string;
  type:        "text" | "textarea" | "number" | "date" | "boolean" | "select";
  required?:   boolean;
  placeholder?: string;
  min?:        number;
  max?:        number;
  options?:    Array<{ value: string; label: string }>;
}

export interface FormRendererProps {
  schema: {
    title:  string;
    fields: FormField[];
  };
  values?:   Record<string, unknown>;
  onChange?: (values: Record<string, unknown>) => void;
  onSubmit?: (values: Record<string, unknown>) => void;
  disabled?: boolean;
}

// ─── Shared input class ───────────────────────────────────────────────────────

const INPUT_BASE =
  "w-full rounded-md border border-sse-border bg-sse-surface px-3 py-2 text-[13px] text-sse-ink " +
  "outline-none placeholder:text-sse-muted " +
  "focus:border-sse-primary focus:ring-1 focus:ring-sse-primary/30 " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "transition-colors";

// ─── Individual field renderers ───────────────────────────────────────────────

function FieldLabel({ field }: { field: FormField }) {
  return (
    <label
      htmlFor={field.id}
      className="block text-[12px] font-medium text-sse-ink mb-1"
    >
      {field.label}
      {field.required && (
        <span className="ml-0.5 text-sse-sem-red-fg" aria-hidden>*</span>
      )}
    </label>
  );
}

function TextField({
  field,
  value,
  onChange,
  disabled,
}: {
  field:    FormField;
  value:    unknown;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <FieldLabel field={field} />
      <input
        id={field.id}
        type="text"
        className={INPUT_BASE}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextareaField({
  field,
  value,
  onChange,
  disabled,
}: {
  field:    FormField;
  value:    unknown;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <FieldLabel field={field} />
      <textarea
        id={field.id}
        className={cn(INPUT_BASE, "min-h-[80px] resize-y")}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberField({
  field,
  value,
  onChange,
  disabled,
}: {
  field:    FormField;
  value:    unknown;
  onChange: (v: number | "") => void;
  disabled: boolean;
}) {
  return (
    <div>
      <FieldLabel field={field} />
      <input
        id={field.id}
        type="number"
        className={INPUT_BASE}
        value={typeof value === "number" ? value : typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        required={field.required}
        disabled={disabled}
        min={field.min}
        max={field.max}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? "" : Number(raw));
        }}
      />
    </div>
  );
}

function DateField({
  field,
  value,
  onChange,
  disabled,
}: {
  field:    FormField;
  value:    unknown;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <FieldLabel field={field} />
      <input
        id={field.id}
        type="date"
        className={INPUT_BASE}
        value={typeof value === "string" ? value : ""}
        required={field.required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function BooleanField({
  field,
  value,
  onChange,
  disabled,
}: {
  field:    FormField;
  value:    unknown;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  const checked = Boolean(value);

  return (
    <div>
      <label className="flex items-center gap-3 cursor-pointer group" htmlFor={field.id}>
        {/* Toggle track */}
        <button
          id={field.id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sse-primary focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            checked
              ? "border-sse-primary bg-sse-primary"
              : "border-sse-border bg-sse-surface",
          )}
        >
          {/* Thumb */}
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
              checked ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>

        <span className="text-[12px] font-medium text-sse-ink select-none">
          {field.label}
          {field.required && (
            <span className="ml-0.5 text-sse-sem-red-fg" aria-hidden>*</span>
          )}
        </span>
      </label>
    </div>
  );
}

function SelectField({
  field,
  value,
  onChange,
  disabled,
}: {
  field:    FormField;
  value:    unknown;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <FieldLabel field={field} />
      <div className="relative">
        <select
          id={field.id}
          className={cn(INPUT_BASE, "appearance-none pr-8 cursor-pointer")}
          value={typeof value === "string" ? value : ""}
          required={field.required}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            {field.placeholder ?? "Selecciona una opción…"}
          </option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sse-muted">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FormRenderer({
  schema,
  values: initialValues,
  onChange,
  onSubmit,
  disabled = false,
}: FormRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>(
    () => initialValues ?? {},
  );

  const handleChange = useCallback(
    (fieldId: string, value: unknown) => {
      setFormValues((prev) => {
        const next = { ...prev, [fieldId]: value };
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit?.(formValues);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-1">
      {/* Form title */}
      {schema.title && (
        <div className="pb-3 mb-4 border-b border-sse-border">
          <h2 className="text-[15px] font-semibold text-sse-ink">{schema.title}</h2>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-4">
        {schema.fields.map((field) => {
          const value = formValues[field.id];

          switch (field.type) {
            case "text":
              return (
                <TextField
                  key={field.id}
                  field={field}
                  value={value}
                  onChange={(v) => handleChange(field.id, v)}
                  disabled={disabled}
                />
              );

            case "textarea":
              return (
                <TextareaField
                  key={field.id}
                  field={field}
                  value={value}
                  onChange={(v) => handleChange(field.id, v)}
                  disabled={disabled}
                />
              );

            case "number":
              return (
                <NumberField
                  key={field.id}
                  field={field}
                  value={value}
                  onChange={(v) => handleChange(field.id, v)}
                  disabled={disabled}
                />
              );

            case "date":
              return (
                <DateField
                  key={field.id}
                  field={field}
                  value={value}
                  onChange={(v) => handleChange(field.id, v)}
                  disabled={disabled}
                />
              );

            case "boolean":
              return (
                <BooleanField
                  key={field.id}
                  field={field}
                  value={value}
                  onChange={(v) => handleChange(field.id, v)}
                  disabled={disabled}
                />
              );

            case "select":
              return (
                <SelectField
                  key={field.id}
                  field={field}
                  value={value}
                  onChange={(v) => handleChange(field.id, v)}
                  disabled={disabled}
                />
              );

            default:
              return (
                <p key={field.id} className="text-[12px] text-sse-sem-red-fg">
                  Campo desconocido: {(field as FormField).type}
                </p>
              );
          }
        })}
      </div>

      {/* Submit */}
      {onSubmit && (
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={disabled}
            className="w-full sm:w-auto"
          >
            Guardar
          </Button>
        </div>
      )}
    </form>
  );
}

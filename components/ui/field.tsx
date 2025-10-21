import * as React from "react";

type FieldProps = {
  label: string;
  error?: string;
  children: React.ReactElement;
  id?: string;
};

export function Field({ label, error, children, id }: FieldProps) {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  const child = React.cloneElement(children, {
    id: fieldId,
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? `${fieldId}-error` : undefined
  });

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="block text-xs font-medium uppercase tracking-wide text-slate-400"
      >
        {label}
      </label>
      {child}
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}


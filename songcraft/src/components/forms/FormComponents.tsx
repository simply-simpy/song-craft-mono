/**
 * Reusable Form Components
 *
 * Components that use the @apply classes from forms.css for consistent styling.
 * Extracted from patterns in songs/new.tsx and lyrics.tsx.
 */

import { forwardRef } from "react";
import type React from "react";
import { cn } from "../../lib/ui-utils";

// Import the CSS so @apply classes are available
import "../../styles/components/forms.css";

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn("form-group", className)}>{children}</div>;
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({
  children,
  required,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      htmlFor={props.htmlFor}
      className={cn("form-label", required && "form-label-required", className)}
      {...props}
    >
      {children}
    </label>
  );
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn("form-input", className)}
        aria-invalid={error}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn("form-textarea", className)}
        aria-invalid={error}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = "FormTextarea";

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn("form-select", className)}
        aria-invalid={error}
        {...props}
      >
        {children}
      </select>
    );
  }
);

FormSelect.displayName = "FormSelect";

interface FormRowProps {
  children: React.ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  const colClass = columns === 3 ? "form-row-3" : "form-row-2";
  return <div className={cn(colClass, className)}>{children}</div>;
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return <div className={cn("form-actions", className)}>{children}</div>;
}

interface FormButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
}

export function FormButton({
  children,
  variant = "primary",
  loading,
  className,
  disabled,
  ...props
}: FormButtonProps) {
  const variantClass = {
    primary: "btn-form-primary",
    secondary: "btn-form-secondary",
    destructive: "btn-form-destructive",
  }[variant];

  return (
    <button
      className={cn(variantClass, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

interface FormHintProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHint({ children, className }: FormHintProps) {
  return <div className={cn("form-hint", className)}>{children}</div>;
}

interface FormErrorProps {
  children: React.ReactNode;
  className?: string;
}

export function FormError({ children, className }: FormErrorProps) {
  return <div className={cn("form-error", className)}>{children}</div>;
}

interface InfoBoxProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoBox({ title, children, className }: InfoBoxProps) {
  return (
    <div className={cn("form-info-box", className)}>
      <div className="title">ℹ️ {title}</div>
      <div className="content">{children}</div>
    </div>
  );
}

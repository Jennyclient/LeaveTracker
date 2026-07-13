import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldLayout = "stacked" | "inline";

const FORM_CONTROL_SLOTS = new Set(["input", "textarea", "select-trigger"]);

function enhanceControlWithError(
  node: ReactNode,
  hasError: boolean,
  describedById?: string
): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    const element = child as ReactElement<{
      children?: ReactNode;
      className?: string;
      "data-slot"?: string;
      "aria-invalid"?: boolean;
      "aria-describedby"?: string;
    }>;
    const slot = element.props["data-slot"];

    if (slot && FORM_CONTROL_SLOTS.has(slot)) {
      return cloneElement(element, {
        "aria-invalid": hasError || undefined,
        "aria-describedby":
          hasError && describedById
            ? describedById
            : element.props["aria-describedby"],
      });
    }

    if (element.props.children) {
      return cloneElement(
        element,
        {},
        enhanceControlWithError(element.props.children, hasError, describedById)
      );
    }

    return child;
  });
}

interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  description?: string;
  error?: string;
  layout?: FormFieldLayout;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  controlClassName?: string;
  children: ReactNode;
}

function FieldErrorMessage({
  id,
  message,
  visible,
}: {
  id?: string;
  message: string;
  visible: boolean;
}) {
  return (
    <p
      id={id}
      className={cn(
        "min-h-[1.125rem] text-xs leading-relaxed text-destructive",
        !visible && "invisible"
      )}
      role={visible ? "alert" : undefined}
      aria-live={visible ? "polite" : undefined}
      aria-hidden={!visible}
    >
      {message}
    </p>
  );
}

function FieldControl({
  children,
  error,
  htmlFor,
  controlClassName,
}: {
  children: ReactNode;
  error?: string;
  htmlFor?: string;
  controlClassName?: string;
}) {
  const hasError = Boolean(error);
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("min-w-0 space-y-1.5", controlClassName)}>
      {enhanceControlWithError(children, hasError, errorId)}
      <FieldErrorMessage
        id={errorId}
        message={error ?? "\u00a0"}
        visible={hasError}
      />
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  layout = "stacked",
  required = false,
  className,
  labelClassName,
  controlClassName,
  children,
}: FormFieldProps) {
  const labelContent = (
    <Label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-snug", labelClassName)}
    >
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
  );

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "grid gap-x-4 gap-y-2 sm:grid-cols-[minmax(9rem,12rem)_1fr] sm:items-start",
          className
        )}
      >
        <div className="space-y-1">
          {labelContent}
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        <FieldControl error={error} htmlFor={htmlFor} controlClassName={controlClassName}>
          {children}
        </FieldControl>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="space-y-1">
        {labelContent}
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <FieldControl error={error} htmlFor={htmlFor} controlClassName={controlClassName}>
        {children}
      </FieldControl>
    </div>
  );
}

interface FormFieldRowProps {
  label: ReactNode;
  htmlFor?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormFieldRow({
  label,
  htmlFor,
  description,
  error,
  required = false,
  className,
  children,
}: FormFieldRowProps) {
  const hasError = Boolean(error);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border p-4",
        hasError && "border-destructive",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <Label htmlFor={htmlFor} className="text-sm font-medium leading-snug">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
        <FieldErrorMessage message={error ?? "\u00a0"} visible={hasError} />
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

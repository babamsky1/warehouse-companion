import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

export interface AddField<T> {
  label: string;
  name: keyof T;
  type?: "text" | "number" | "email" | "password" | "select" | "textarea";
  placeholder?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  required?: boolean;
  validation?: (value: unknown) => string | null;
  helperText?: string;
  fullWidth?: boolean;
}

interface FormModalProps<T> {
  title: string;
  description?: string;
  fields: AddField<T>[];
  onSubmit: (data: T) => Promise<void> | void;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  triggerSize?: "default" | "sm" | "lg" | "icon";
  submitLabel?: string;
  isOpen?: boolean;
  initialData?: Partial<T>;
  successMessage?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  columns?: 1 | 2;
}

const AddModal = <T extends object>({
  title,
  description,
  fields,
  onSubmit,
  onOpenChange,
  triggerLabel = "Add New",
  triggerIcon,
  triggerSize = "default",
  submitLabel = "Save",
  isOpen: controlledIsOpen,
  initialData,
  successMessage,
  size = "md",
  columns = 1,
}: FormModalProps<T>) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [formData, setFormData] = useState<Partial<T>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    "2xl": "max-w-4xl",
  };

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, initialData]);

  const validateField = (field: AddField<T>, value: unknown): string | null => {
    if (field.required && (value === "" || value === null || value === undefined)) {
      return `${field.label} is required`;
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        return "Please enter a valid email";
      }
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const handleChange = (name: keyof T, value: unknown) => {
    const finalValue =
      typeof value === "number" && value < 0 ? 0 : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    if (errors[String(name)]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[String(name)];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[String(field.name)] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);
      await onSubmit(formData as T);
      setIsOpen(false);
      onOpenChange?.(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size={triggerSize}>
          {triggerIcon || <Plus className="h-4 w-4 mr-2" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className={maxWidth[size]}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>

          {apiError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className={cn(
            "py-4",
            columns === 1 ? "space-y-4" : "grid grid-cols-2 gap-4"
          )}>
            {fields.map((field) => (
              <div 
                key={String(field.name)} 
                className={cn(
                  "grid gap-2",
                  field.fullWidth && columns > 1 && "col-span-2"
                )}
              >
                <Label htmlFor={String(field.name)}>
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </Label>

                {field.type === "select" ? (
                  <select
                    id={String(field.name)}
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors[String(field.name)]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-input"
                    }`}
                    value={String(formData[field.name] ?? "")}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value)
                    }
                    disabled={field.disabled || isLoading}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    id={String(field.name)}
                    className={`flex min-h-24 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors[String(field.name)]
                        ? "border-red-500 focus:ring-red-500"
                        : "border-input"
                    }`}
                    value={String(formData[field.name] ?? "")}
                    placeholder={field.placeholder}
                    disabled={field.disabled || isLoading}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value)
                    }
                  />
                ) : (
                  <Input
                    id={String(field.name)}
                    type={field.type || "text"}
                    value={String(formData[field.name] ?? "")}
                    placeholder={field.placeholder}
                    disabled={field.disabled || isLoading}
                    min={field.type === "number" ? 0 : undefined}
                    className={
                      errors[String(field.name)]
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                    onChange={(e) =>
                      handleChange(
                        field.name,
                        field.type === "number"
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                  />
                )}

                {errors[String(field.name)] && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors[String(field.name)]}
                  </p>
                )}

                {field.helperText && !errors[String(field.name)] && (
                  <p className="text-xs text-muted-foreground">
                    {field.helperText}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;

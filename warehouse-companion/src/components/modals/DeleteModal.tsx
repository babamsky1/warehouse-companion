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
import { AlertTriangle, Loader2, Trash } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

interface DeleteModalProps {
  title?: string;
  description?: string;
  onSubmit: () => Promise<void> | void;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
  triggerIcon?: ReactNode;
  triggerSize?: "default" | "sm" | "lg" | "icon";
  submitLabel?: string;
  isOpen?: boolean;
  size?: "sm" | "md" | "lg";
}

const DeleteModal = ({
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  onSubmit,
  onOpenChange,
  triggerLabel = "Delete",
  triggerIcon,
  triggerSize = "default",
  submitLabel = "Delete",
  isOpen: controlledIsOpen,
  size = "md",
}: DeleteModalProps) => {
  const [isOpen, setIsOpen] = useState(controlledIsOpen ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const maxWidth = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen);
    }
  }, [controlledIsOpen]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      await onSubmit();
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
        <Button variant="ghost" size={triggerSize} className="text-red-500 justify-start hover:text-white hover:bg-destructive/100 w-full">
          {triggerIcon || <Trash className="h-4 w-4 mr-2" />}
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className={maxWidth[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {apiError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;

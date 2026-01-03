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
import { HelpCircle, Loader2 } from "lucide-react";
import { ReactNode, useState } from "react";

interface DecisionModalProps {
  title: string;
  description: string;
  onConfirm: () => Promise<void> | void;
  trigger?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  icon?: ReactNode;
}

const DecisionModal = ({
  title,
  description,
  onConfirm,
  trigger,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon,
}: DecisionModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error("Decision failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantStyles = {
    default: "bg-primary hover:bg-primary/90",
    destructive: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    warning: "bg-warning hover:bg-warning/90 text-warning-foreground",
    success: "bg-success hover:bg-success/90 text-success-foreground",
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {icon || <HelpCircle className="h-6 w-6" />}
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1.5">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={variantStyles[variant]}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DecisionModal;

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Dialog: React.FC<ModalProps> = ({ open, onOpenChange, className, children, ...props }) => {
  if (!open) return null;
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/40", className)} {...props}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {children}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-4", className)} {...props} />
);

export const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
);

export const DialogActions: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("flex justify-end gap-2 mt-4", className)} {...props} />
);

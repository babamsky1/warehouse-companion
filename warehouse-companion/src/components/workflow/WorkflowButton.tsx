import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, Play } from "lucide-react";

// Generic type-safe workflow transition
export interface WorkflowTransition<TStatus extends string> {
  from: TStatus;
  to: TStatus;
  label: string;
}

interface WorkflowButtonProps<TStatus extends string> {
  transitions: readonly WorkflowTransition<TStatus>[]; // allowed steps
  currentStatus: TStatus; // current step
  onTransition: (nextStatus: TStatus) => void; // callback to update status
  isAssigned: boolean; // disable if not assigned
  isLoading?: boolean;
}

export const WorkflowButton = <TStatus extends string>({
  transitions,
  currentStatus,
  onTransition,
  isAssigned,
  isLoading = false,
}: WorkflowButtonProps<TStatus>) => {
  // Find the next available transition
  const transition = transitions.find((t) => t.from === currentStatus);

  // If no next transition, it's the final state
  const isFinalState = !transition;

  return (
    <Button
      size="sm"
      disabled={!isAssigned || isFinalState || isLoading}
      onClick={() => transition && onTransition(transition.to)}
      className={cn(
        "transition-all duration-200 px-4 py-2", // use padding, remove fixed width
        isFinalState &&
        "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50 cursor-default shadow-none",
        !isAssigned && "opacity-50 grayscale cursor-not-allowed"
      )}
      variant={isFinalState ? "outline" : "default"}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
          Processing...
        </>
      ) : isFinalState ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
          {currentStatus}
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5 mr-2 fill-current" />
          {transition.label}
        </>
      )}
    </Button>
  );
};

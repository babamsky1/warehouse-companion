import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Play } from "lucide-react";

// --- Workflow Step Interface ---
export interface WorkflowStep<TStatus = string> {
  id: TStatus;
  label: string;
}

// --- Props Interface ---
interface WorkflowStepperProps<TStatus extends string> {
  steps: WorkflowStep<TStatus>[];
  currentStatus: TStatus;
  onStepClick: (stepId: TStatus) => void;
  isAssigned?: boolean; // if false, buttons are disabled
  isLoading?: boolean;
}

// --- Component ---
export function WorkflowStepper<TStatus extends string>({
  steps,
  currentStatus,
  onStepClick,
  isAssigned = true,
  isLoading = false,
}: WorkflowStepperProps<TStatus>) {
  // Determine if current step is the last
  const currentStepIndex = steps.findIndex((s) => s.id === currentStatus);
  const isFinalStep = currentStepIndex === steps.length - 1;

  // Determine next step
  const nextStep = !isFinalStep ? steps[currentStepIndex + 1] : undefined;

  return (
    <Button
      size="sm"
      variant={isFinalStep ? "outline" : "default"}
      disabled={!isAssigned || isFinalStep || isLoading}
      onClick={() => nextStep && onStepClick(nextStep.id)}
      className={cn(
        "min-w-[140px] transition-all duration-200",
        isFinalStep && "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default shadow-none",
        !isAssigned && "opacity-50 grayscale cursor-not-allowed"
      )}
    >
      {isLoading ? (
        <>
          <Play className="h-3.5 w-3.5 mr-2 animate-spin" />
          Processing...
        </>
      ) : isFinalStep ? (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
          {currentStatus}
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5 mr-2" />
          {nextStep?.label}
        </>
      )}
    </Button>
  );
}

import { cn } from "@/utils/cn";
import { Loader2Icon } from "lucide-react";

/** @example <Spinner /> — ver uso real en @/components/queryState.tsx (QueryLoading) */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };

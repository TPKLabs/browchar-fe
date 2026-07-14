import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

/** @example <Spinner /> — ver uso real en @/components/query-state.tsx (QueryLoading) */
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

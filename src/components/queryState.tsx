import { Empty, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export function QueryLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-sm"
    >
      <Spinner role={undefined} aria-hidden />
      {label}
    </div>
  );
}

export function QueryError({ label }: { label: string }) {
  return (
    <p
      role="alert"
      className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm"
    >
      {label}
    </p>
  );
}

export function QueryEmpty({ label }: { label: string }) {
  return (
    <Empty className="border p-10">
      <EmptyDescription>{label}</EmptyDescription>
    </Empty>
  );
}

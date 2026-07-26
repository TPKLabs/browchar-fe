import { notFound } from "next/navigation";

import { DesignSystemPreview } from "@/components/dev/designSystemPreview";

/**
 * Página interna kitchen-sink (DEV-207).
 *
 * Dev-only: `notFound()` en producción y no está linkeada desde el navbar.
 */
export default function DevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <DesignSystemPreview />;
}

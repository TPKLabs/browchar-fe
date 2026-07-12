import { PlaybooksList } from "@/components/playbooks/playbooks-list";

export default function PlaybooksPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-wide">
          Playbooks
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Elegí un playbook para crear un personaje nuevo.
        </p>
      </div>

      <PlaybooksList />
    </div>
  );
}

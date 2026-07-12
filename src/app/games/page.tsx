import { GamesList } from "@/components/games/games-list";

export default function GamesPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-wide">
          Juegos
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Elegí un juego para ver sus playbooks disponibles.
        </p>
      </div>

      <GamesList />
    </div>
  );
}

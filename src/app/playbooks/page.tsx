import { BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlaybookView } from "@/lib/types";

/**
 * Placeholder hasta que exista el feature de Playbooks (hook + api module,
 * ver skill add-feature) contra `GET /playbooks`.
 */
const PLAYBOOKS: PlaybookView[] = [
  {
    id: "1",
    name: "Guerrero",
    version: 3,
    createdAt: new Date().toISOString(),
    description:
      "Combatiente cuerpo a cuerpo con foco en resistencia y daño físico.",
    template: [],
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
  },
  {
    id: "2",
    name: "Clérigo",
    version: 2,
    createdAt: new Date().toISOString(),
    description: "Sanador y soporte con magia divina.",
    template: [],
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
  },
  {
    id: "3",
    name: "Piromante",
    version: 1,
    createdAt: new Date().toISOString(),
    description: "Especialista en magia de fuego de área.",
    template: [],
    game: { gameId: "pathfinder", gameName: "Pathfinder" },
  },
];

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLAYBOOKS.map((playbook) => (
          <Card key={playbook.id}>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
                <BookOpen className="text-primary size-4" aria-hidden />
                {playbook.name}
              </CardTitle>
              <CardDescription>{playbook.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">{playbook.game.gameName}</Badge>
              <Badge variant="outline">v{playbook.version}</Badge>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Crear personaje</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

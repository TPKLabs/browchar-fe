import Link from "next/link";
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
import { MOCK_PLAYBOOKS } from "@/lib/mocks/playbooks";

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
        {MOCK_PLAYBOOKS.map((playbook) => (
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
              <Button
                className="w-full"
                nativeButton={false}
                render={
                  <Link href={`/characters/new?playbookId=${playbook.id}`} />
                }
              >
                Crear personaje
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

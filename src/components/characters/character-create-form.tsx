"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CircleAlert, CircleCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateCharacterInput, PlaybookView } from "@/lib/types";

import {
  buildCharacterSchema,
  buildDefaultValues,
  type CharacterFormValues,
} from "@/lib/characters/character-schema";
import { DynamicField } from "./dynamic-field";

/** Sin auth todavía (DEV-5): el owner viaja hardcodeado en modo dev. */
const DEV_OWNER_ID = "dev-owner";

interface CharacterCreateFormProps {
  playbooks: PlaybookView[];
  initialPlaybookId?: string;
  /**
   * Seam para la integración real con la API (otra subtask). Por defecto es un
   * stub local que simula latencia y resuelve OK, sin pegarle al back.
   */
  onSubmit?: (input: CreateCharacterInput) => Promise<void>;
}

async function stubSubmit(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export function CharacterCreateForm({
  playbooks,
  initialPlaybookId,
  onSubmit = stubSubmit,
}: CharacterCreateFormProps) {
  // Deep-link: si viene un playbookId válido, preseleccionamos su juego y él.
  const initialPlaybook = playbooks.find((p) => p.id === initialPlaybookId);
  const [selectedGameId, setSelectedGameId] = useState(
    initialPlaybook?.game.gameId ?? "",
  );
  const [selectedPlaybookId, setSelectedPlaybookId] = useState(
    initialPlaybook?.id ?? "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  // Juegos únicos disponibles (derivados de los playbooks).
  const games = useMemo(() => {
    const byId = new Map<string, string>();
    for (const playbook of playbooks) {
      byId.set(playbook.game.gameId, playbook.game.gameName);
    }
    return [...byId].map(([gameId, gameName]) => ({ gameId, gameName }));
  }, [playbooks]);

  const playbooksForGame = useMemo(
    () => playbooks.filter((p) => p.game.gameId === selectedGameId),
    [playbooks, selectedGameId],
  );

  const selectedPlaybook = useMemo(
    () => playbooks.find((p) => p.id === selectedPlaybookId),
    [playbooks, selectedPlaybookId],
  );

  // El schema y los defaults dependen solo del playbook elegido: los memoizamos
  // para no reconstruir el schema Zod en cada render.
  const resolver = useMemo(
    () => zodResolver(buildCharacterSchema(selectedPlaybook)),
    [selectedPlaybook],
  );
  const defaultValues = useMemo(
    () => buildDefaultValues(selectedPlaybook),
    [selectedPlaybook],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CharacterFormValues>({
    resolver,
    defaultValues,
    mode: "onSubmit",
  });

  // Al cambiar de juego se invalida el playbook elegido: reseteamos ambos.
  const handleGameChange = (value: string | null) => {
    setSelectedGameId(value ?? "");
    setSelectedPlaybookId("");
    reset(buildDefaultValues(undefined));
    setSubmitError(null);
    setCreatedName(null);
  };

  // Al cambiar de playbook, el schema y los campos cambian: reseteamos el form
  // (con los defaults del nuevo template) y limpiamos los estados de resultado.
  const handlePlaybookChange = (value: string | null) => {
    const id = value ?? "";
    setSelectedPlaybookId(id);
    reset(buildDefaultValues(playbooks.find((p) => p.id === id)));
    setSubmitError(null);
    setCreatedName(null);
  };

  const valuesErrors = errors.values as
    Record<string, { message?: string } | undefined> | undefined;
  const fieldError = (id: string) => valuesErrors?.[id]?.message;

  const handleValid = async (data: CharacterFormValues) => {
    if (!selectedPlaybook) return;
    setSubmitError(null);
    const input: CreateCharacterInput = {
      name: data.name,
      playbookId: selectedPlaybook.id,
      ownerId: DEV_OWNER_ID,
      values: data.values,
    };
    try {
      await onSubmit(input);
      setCreatedName(input.name);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo crear el personaje. Intentá de nuevo.",
      );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-wide">
          Crear personaje
        </h1>
        <p className="text-muted-foreground text-base">
          Elegí un juego y un playbook; la ficha se arma a partir de su
          plantilla.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-select">Juego</Label>
          <Select value={selectedGameId} onValueChange={handleGameChange}>
            <SelectTrigger id="game-select" className="w-full">
              <SelectValue>
                {(value) =>
                  games.find((g) => g.gameId === value)?.gameName ??
                  "Elegí un juego"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {games.map((game) => (
                <SelectItem key={game.gameId} value={game.gameId}>
                  {game.gameName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="playbook-select">Playbook</Label>
          <Select
            value={selectedPlaybookId}
            onValueChange={handlePlaybookChange}
          >
            <SelectTrigger
              id="playbook-select"
              className="w-full"
              disabled={!selectedGameId}
            >
              <SelectValue>
                {(value) =>
                  playbooks.find((p) => p.id === value)?.name ??
                  (selectedGameId
                    ? "Elegí un playbook"
                    : "Elegí un juego primero")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {playbooksForGame.map((playbook) => (
                <SelectItem key={playbook.id} value={playbook.id}>
                  {playbook.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedPlaybook ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {selectedGameId
            ? "Elegí un playbook para empezar a completar la ficha."
            : "Elegí un juego y un playbook para empezar."}
        </p>
      ) : createdName ? (
        <div
          role="status"
          className="border-primary/30 bg-primary/5 flex flex-col items-start gap-3 rounded-lg border p-6"
        >
          <p className="flex items-center gap-2 font-medium">
            <CircleCheck className="text-primary size-5" aria-hidden />
            Personaje «{createdName}» listo para crear.
          </p>
          <p className="text-muted-foreground text-sm">
            La validación pasó. La creación real contra la API se conecta en
            otra tarea.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                reset(buildDefaultValues(selectedPlaybook));
                setCreatedName(null);
              }}
            >
              Crear otro
            </Button>
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/playbooks" />}
            >
              Volver al listado
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(handleValid)} noValidate>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedPlaybook.name}</CardTitle>
              <CardDescription>
                {selectedPlaybook.game.gameName} · v{selectedPlaybook.version}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6">
              {submitError ? (
                <div
                  role="alert"
                  className="text-destructive bg-destructive/10 flex items-center gap-2 rounded-lg p-3 text-sm"
                >
                  <CircleAlert className="size-4 shrink-0" aria-hidden />
                  {submitError}
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="character-name">
                  Nombre
                  <span className="text-destructive" aria-hidden>
                    *
                  </span>
                </Label>
                <Input
                  id="character-name"
                  {...register("name")}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "character-name-error" : undefined
                  }
                />
                {errors.name ? (
                  <p
                    id="character-name-error"
                    role="alert"
                    className="text-destructive text-xs"
                  >
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              {selectedPlaybook.template.map((section) => (
                <fieldset key={section.id} className="flex flex-col gap-4">
                  {section.title ? (
                    <legend className="font-heading text-sm font-medium tracking-wide">
                      {section.title}
                    </legend>
                  ) : null}
                  {section.description ? (
                    <p className="text-muted-foreground -mt-2 text-xs">
                      {section.description}
                    </p>
                  ) : null}
                  {(section.fields ?? []).map((field) => (
                    <DynamicField
                      key={field.id}
                      field={field}
                      control={control}
                      error={fieldError(field.id)}
                    />
                  ))}
                </fieldset>
              ))}
            </CardContent>

            <CardFooter className="justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/playbooks" />}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden />
                    Creando…
                  </>
                ) : (
                  "Crear personaje"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}

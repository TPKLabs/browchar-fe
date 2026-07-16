"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Swords, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CharacterView, PlaybookView } from "@/types";
import { formatDate, formatRelativeDate } from "@/utils/dates";
import {
  buildCharacterSchema,
  buildValuesFromCharacter,
  type CharacterFormValues,
} from "@/schemas/characterSchema";
import { DynamicField } from "./dynamicField";

interface CharacterDetailProps {
  character: CharacterView;
  playbook: PlaybookView;
  /**
   * Seam para la integración real con `PATCH /characters/:id` (DEV-53,
   * todavía sin backend). Por defecto simula latencia y resuelve OK, sin
   * pegarle a la API — mismo patrón que `CharacterCreateForm.onSubmit`.
   */
  onSave?: (values: CharacterFormValues) => Promise<void>;
}

async function stubSave(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

/**
 * Detalle de un Character (DEV-51). No hay modo solo-lectura: los campos
 * siempre están listos para editar (mismo `DynamicField` que arma
 * `CharacterCreateForm`, precargado con los valores actuales vía
 * `buildValuesFromCharacter`). "Guardar cambios" se habilita recién cuando
 * el form queda dirty (`formState.isDirty`) — nada que guardar hasta que se
 * toque algo.
 *
 * "Guardar cambios" es un stub (`onSave` por defecto): `PATCH
 * /characters/:id` no existe todavía (DEV-53). Al guardar, `reset(data)`
 * fija esos valores como nuevo baseline (el form vuelve a estar "limpio" y
 * el botón se deshabilita otra vez) — no se persiste ni se refetchea.
 * "Cancelar" descarta cualquier edición sin guardar, volviendo al último
 * baseline. "Eliminar" sigue el mismo criterio de stub que `CharacterCard`:
 * confirma y vuelve al listado sin pegarle al backend.
 *
 * Auto-save (cada 7s si hay cambios sin guardar) queda documentado como
 * requerimiento en DEV-53, no implementado acá.
 */
export function CharacterDetail({
  character,
  playbook,
  onSave = stubSave,
}: CharacterDetailProps) {
  const router = useRouter();

  const resolver = useMemo(
    () => zodResolver(buildCharacterSchema(playbook)),
    [playbook],
  );
  const defaultValues = useMemo(
    () => buildValuesFromCharacter(playbook, character),
    [playbook, character],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CharacterFormValues>({
    resolver,
    defaultValues,
    mode: "onSubmit",
  });

  const valuesErrors = errors.values as
    Record<string, { message?: string } | undefined> | undefined;
  const fieldError = (id: string) => valuesErrors?.[id]?.message;

  const handleCancel = () => {
    // Known issue (ver PR #28 / DEV-65): `defaultValues` queda pinneado a los
    // `character`/`playbook` props originales, así que tras un Guardar
    // cambios exitoso, Cancelar revierte hasta el estado pre-sesión en vez
    // del último guardado — descarta silenciosamente ese guardado. Bajo
    // impacto hoy porque Guardar cambios es un stub sin persistencia real;
    // se corrige junto con la integración real de PATCH /characters/:id
    // (DEV-53/DEV-65), donde probablemente alcance con `reset()` sin
    // argumentos en vez de `reset(defaultValues)`.
    reset(defaultValues);
  };

  const handleValid = async (data: CharacterFormValues) => {
    await onSave(data);
    // Fija los valores guardados como nuevo baseline: el form queda "limpio"
    // (isDirty vuelve a false) hasta la próxima edición.
    reset(data);
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${character.name}?`)) {
      router.push("/characters");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      {/* Encabezado accesible de la página: el nombre visible vive en el
          campo "Nombre" de más abajo, este heading solo aporta el landmark
          para lectores de pantalla. */}
      <h1 className="sr-only">{character.name}</h1>

      <form onSubmit={handleSubmit(handleValid)} noValidate>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/characters" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Personajes
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={!isDirty || isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 data-icon="inline-start" />
              Eliminar
            </Button>
            <Button type="submit" size="sm" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Guardando…
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{playbook.game.gameName}</Badge>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="playbook-select">Playbook</Label>
              {/* Solo lectura por ahora: reasignar el playbook implica
                  reconstruir template/values (como en CharacterCreateForm) y
                  todavía no está resuelto — ver PR #28. Es un <Select>, no un
                  chip, para que combine visualmente con el resto del form,
                  siempre editable. */}
              <Select value={playbook.id} disabled>
                <SelectTrigger id="playbook-select" className="w-full" disabled>
                  <SelectValue>{() => playbook.name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={playbook.id}>{playbook.name}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="character-name">
                <Swords className="text-primary size-4 shrink-0" aria-hidden />
                Nombre
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
            <p className="text-muted-foreground text-xs">
              Creado el {formatDate(character.createdAt)} · última edición{" "}
              <span title={formatDate(character.updatedAt)}>
                {formatRelativeDate(character.updatedAt)}
              </span>
            </p>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <p className="text-muted-foreground text-xs">
              Los cambios se guardan localmente: la integración con la API
              todavía no existe (DEV-53).
            </p>
            {playbook.template.map((section) => {
              const fields = section.fields ?? [];
              if (fields.length === 0) return null;

              return (
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
                  {fields.map((field) => (
                    <DynamicField
                      key={field.id}
                      field={field}
                      control={control}
                      error={fieldError(field.id)}
                    />
                  ))}
                </fieldset>
              );
            })}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

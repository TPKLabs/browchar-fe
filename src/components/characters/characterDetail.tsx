"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Swords, Trash2 } from "lucide-react";

import { ApiError } from "@/api/client";
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
   * Seam para la integración con `PATCH /characters/:id` (DEV-68). La
   * integración real la conecta `CharacterDetailContainer` vía
   * `useUpdateCharacter`; por defecto es un stub que simula latencia y
   * resuelve OK sin pegarle a la API, para poder previsualizar/testear este
   * componente aislado del data layer.
   */
  onSave?: (values: CharacterFormValues) => Promise<void>;
}

async function stubSave(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

/** Cada cuánto se dispara el auto-save mientras hay cambios sin guardar (DEV-65). */
const AUTO_SAVE_INTERVAL_MS = 7000;
/** Cuánto queda visible el "Guardado" del auto-save antes de desaparecer. */
const AUTO_SAVE_SAVED_MESSAGE_MS = 2000;

function saveErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404)
      return "Este personaje no existe o fue eliminado.";
    if (error.status === 400) {
      return error.message || "Los datos ingresados no son válidos.";
    }
  }
  return "No se pudo guardar el personaje. Intentá de nuevo más tarde.";
}

/**
 * Detalle de un Character (DEV-51). No hay modo solo-lectura: los campos
 * siempre están listos para editar (mismo `DynamicField` que arma
 * `CharacterCreateForm`, precargado con los valores actuales vía
 * `buildValuesFromCharacter`). "Guardar cambios" se habilita recién cuando
 * el form queda dirty (`formState.isDirty`) — nada que guardar hasta que se
 * toque algo.
 *
 * Al guardar, `reset(data)` fija esos valores como nuevo baseline del form
 * (queda "limpio" y el botón se deshabilita otra vez) — sea cual sea la
 * implementación real de `onSave` (DEV-68). Si `onSave` rechaza, se muestra
 * un mensaje según el tipo de error (`saveErrorMessage`) sin tocar el
 * baseline. "Cancelar" descarta cualquier edición sin guardar, volviendo al
 * último baseline (el guardado más reciente, no necesariamente los props
 * originales — ver `handleCancel`). "Eliminar" sigue el mismo criterio de
 * stub que `CharacterCard`: confirma y vuelve al listado sin pegarle al
 * backend.
 *
 * Auto-save (DEV-65, requerimiento agregado 2026-07-15): mientras el form
 * está dirty, se dispara un guardado automático cada `AUTO_SAVE_INTERVAL_MS`
 * (intervalo fijo desde que quedó dirty, no debounce por keystroke — no
 * espera una pausa en el tipeo). Reusa el mismo `onSave`/manejo de errores
 * que el guardado manual; se salta el tick si ya hay un submit en curso
 * (`isSubmittingRef`, evita pisarse con un guardado manual concurrente). El
 * feedback ("Guardando…" / "Guardado") es un texto aparte junto al botón,
 * que no toca el propio "Guardar cambios" (ese solo refleja submits
 * manuales vía `isSubmitting`).
 */
export function CharacterDetail({
  character,
  playbook,
  onSave = stubSave,
}: CharacterDetailProps) {
  const router = useRouter();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const autoSaveSavedTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const resolver = useMemo(
    () => zodResolver(buildCharacterSchema(playbook)),
    [playbook],
  );
  const defaultValues = useMemo(
    () => buildValuesFromCharacter(playbook, character),
    [playbook, character],
  );
  // Baseline explícito para "Cancelar" — separado de `defaultValues` (que
  // queda pinneado a los props del mount) porque un guardado exitoso lo
  // corre hacia adelante. Ver `handleCancel`.
  const [savedValues, setSavedValues] =
    useState<CharacterFormValues>(defaultValues);

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

  // Ref espejo de `isSubmitting`: la lee el interval del auto-save (más
  // abajo) para no pisar un submit en curso sin tener que recrear el
  // interval en cada cambio de `isSubmitting`.
  const isSubmittingRef = useRef(isSubmitting);
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  const valuesErrors = errors.values as
    Record<string, { message?: string } | undefined> | undefined;
  const fieldError = (id: string) => valuesErrors?.[id]?.message;

  const handleCancel = () => {
    // Known issue (ver PR #28 / DEV-65), corregido en DEV-68: `reset(
    // defaultValues)` quedaba pinneado a los props del mount, así que tras un
    // Guardar cambios exitoso, Cancelar revertía hasta el estado pre-sesión
    // en vez del último guardado. `savedValues` sigue al guardado más
    // reciente (ver `handleValid`), así Cancelar siempre vuelve ahí.
    reset(savedValues);
    setSaveError(null);
  };

  /** Guarda `data` y fija el nuevo baseline. Usado por el submit manual y por el auto-save. */
  const persist = async (data: CharacterFormValues) => {
    setSaveError(null);
    await onSave(data);
    // Fija los valores guardados como nuevo baseline: el form queda
    // "limpio" (isDirty vuelve a false) hasta la próxima edición.
    reset(data);
    setSavedValues(data);
  };

  const handleValid = async (data: CharacterFormValues) => {
    try {
      await persist(data);
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    }
  };

  const runAutoSave = async (data: CharacterFormValues) => {
    setAutoSaveStatus("saving");
    try {
      await persist(data);
      setAutoSaveStatus("saved");
      if (autoSaveSavedTimeout.current)
        clearTimeout(autoSaveSavedTimeout.current);
      autoSaveSavedTimeout.current = setTimeout(
        () => setAutoSaveStatus("idle"),
        AUTO_SAVE_SAVED_MESSAGE_MS,
      );
    } catch (error) {
      setAutoSaveStatus("idle");
      setSaveError(saveErrorMessage(error));
    }
  };

  // Ref "última versión" de `runAutoSave`: se actualiza en cada render (sin
  // deps) para que el interval de abajo siempre llame a la versión más
  // reciente (con el `onSave`/`persist` vigente), sin tener que recrear el
  // interval — y sin reiniciar la cuenta de 7s — en cada render.
  const runAutoSaveRef = useRef(runAutoSave);
  useEffect(() => {
    runAutoSaveRef.current = runAutoSave;
  });

  useEffect(() => {
    if (!isDirty) return;
    const id = setInterval(() => {
      if (isSubmittingRef.current) return;
      void handleSubmit((data) => runAutoSaveRef.current(data))();
    }, AUTO_SAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isDirty, handleSubmit]);

  useEffect(() => {
    return () => {
      if (autoSaveSavedTimeout.current)
        clearTimeout(autoSaveSavedTimeout.current);
    };
  }, []);

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
          <div className="flex flex-wrap items-center gap-2">
            {autoSaveStatus !== "idle" ? (
              <span role="status" className="text-muted-foreground text-xs">
                {autoSaveStatus === "saving" ? "Guardando…" : "Guardado"}
              </span>
            ) : null}
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
              disabled={isSubmitting}
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

        {saveError ? (
          <p role="alert" className="text-destructive mt-2 text-sm">
            {saveError}
          </p>
        ) : null}

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
                disabled={isSubmitting}
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
                      disabled={isSubmitting}
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

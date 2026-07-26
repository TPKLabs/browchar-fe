import type { ReactNode } from "react";
import { Inbox, Swords, Trash2 } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radioGroup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

/** Catálogo de primitivos de UI en claro y oscuro para la ruta interna /dev. */
export function DesignSystemPreview() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl tracking-wide">Design system</h1>
        <p className="text-muted-foreground text-sm">
          Primitivos de <code>src/components/ui</code> en sus variantes, en tema
          claro y oscuro. Página interna (<code>/dev</code>), solo en
          desarrollo.
        </p>
      </header>

      {/* Dos columnas idénticas: el `.dark` del wrapper derecho activa el
          `@custom-variant dark (&:is(.dark *))` sobre todos sus descendientes.
          Caveat: los popups de `Select` se portalizan al root (fuera del
          `.dark`), así que su desplegable se ve en claro aunque el trigger esté
          en la columna oscura — el trigger igual sirve para verificar el tema. */}
      <div className="bg-border grid gap-px overflow-hidden rounded-xl md:grid-cols-2">
        <ThemeColumn idPrefix="light" label="Claro" />
        <ThemeColumn idPrefix="dark" label="Oscuro" dark />
      </div>
    </div>
  );
}

function ThemeColumn({
  idPrefix,
  label,
  dark = false,
}: {
  idPrefix: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`bg-background text-foreground flex flex-col gap-8 p-6 ${dark ? "dark" : ""}`}
    >
      <Badge variant="outline" className="w-fit">
        {label}
      </Badge>
      <UiShowcase idPrefix={idPrefix} />
    </div>
  );
}

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;

const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

/** El catálogo en sí. Se renderiza una vez por columna (claro / oscuro). */
function UiShowcase({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Button — variants × sizes">
        <div className="flex flex-col gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              {BUTTON_SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant}
                </Button>
              ))}
              <Button variant={variant} disabled>
                disabled
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Button — icon sizes">
        <div className="flex flex-wrap items-center gap-2">
          {ICON_SIZES.map((size) => (
            <Button key={size} variant="outline" size={size} aria-label={size}>
              <Swords aria-hidden />
            </Button>
          ))}
          <Button variant="destructive" size="icon" aria-label="Eliminar">
            <Trash2 aria-hidden />
          </Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap items-center gap-2">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Card">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">D&amp;D 5e</Badge>
              <Badge variant="outline">La Mina Perdida</Badge>
            </div>
            <CardTitle className="flex items-center gap-2">
              <Swords className="text-primary size-4" aria-hidden />
              Thorin Piedrascudo
            </CardTitle>
            <CardDescription>Guerrero — Enano de las colinas</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Ejemplo de contenido de una tarjeta.
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" className="flex-1">
              Ver detalle
            </Button>
            <Button variant="destructive" size="icon" aria-label="Eliminar">
              <Trash2 aria-hidden />
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Input / Textarea">
        <div className="grid w-full max-w-md gap-4">
          <Field label="Normal" htmlFor={`${idPrefix}-ks-input`}>
            <Input id={`${idPrefix}-ks-input`} placeholder="tu@email.com" />
          </Field>
          <Field
            label="Deshabilitado"
            htmlFor={`${idPrefix}-ks-input-disabled`}
          >
            <Input
              id={`${idPrefix}-ks-input-disabled`}
              placeholder="tu@email.com"
              disabled
            />
          </Field>
          <Field label="Inválido" htmlFor={`${idPrefix}-ks-input-invalid`}>
            <Input
              id={`${idPrefix}-ks-input-invalid`}
              defaultValue="no válido"
              aria-invalid
            />
          </Field>
          <Field label="Textarea" htmlFor={`${idPrefix}-ks-textarea`}>
            <Textarea
              id={`${idPrefix}-ks-textarea`}
              placeholder="Descripción…"
            />
          </Field>
        </div>
      </Section>

      <Section title="Checkbox / Radio / Select">
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex flex-col gap-2">
            <Label className="gap-2">
              <Checkbox /> Sin marcar
            </Label>
            <Label className="gap-2">
              <Checkbox defaultChecked /> Marcado
            </Label>
            <Label className="gap-2">
              <Checkbox disabled /> Deshabilitado
            </Label>
            <Label className="gap-2">
              <Checkbox aria-invalid /> Inválido
            </Label>
          </div>

          <RadioGroup defaultValue="guerrero" className="w-fit">
            <Label className="gap-2">
              <RadioGroupItem value="guerrero" /> Guerrero
            </Label>
            <Label className="gap-2">
              <RadioGroupItem value="mago" /> Mago
            </Label>
            <Label className="gap-2">
              <RadioGroupItem value="picaro" /> Pícaro
            </Label>
          </RadioGroup>

          <Select defaultValue="dnd5e">
            <SelectTrigger>
              <SelectValue placeholder="Elegí un sistema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dnd5e">D&amp;D 5e</SelectItem>
              <SelectItem value="pbta">Powered by the Apocalypse</SelectItem>
              <SelectItem value="fate">Fate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Skeleton / Spinner">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex w-48 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Spinner />
            <Spinner className="size-6" />
            <Spinner className="text-primary size-8" />
          </div>
        </div>
      </Section>

      <Section title="Empty">
        <Empty className="max-w-sm border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>
              No hay personajes que coincidan con la búsqueda.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
